// import { discovery } from 'openid-client';
import { users } from '@shared/schema';
import connectPg from 'connect-pg-simple';
import { eq } from 'drizzle-orm';
import session from 'express-session';
import memoize from 'memoizee';
import passport from 'passport';
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';
import { db } from './db';

if (!process.env.KEYCLOAK_BASE_URL) {
  throw new Error('Environment variable KEYCLOAK_BASE_URL not provided');
}

if (!process.env.KEYCLOAK_REALM) {
  throw new Error('Environment variable KEYCLOAK_REALM not provided');
}

if (!process.env.KEYCLOAK_CLIENT_ID) {
  throw new Error('Environment variable KEYCLOAK_CLIENT_ID not provided');
}

if (!process.env.KEYCLOAK_CLIENT_SECRET) {
  throw new Error('Environment variable KEYCLOAK_CLIENT_SECRET not provided');
}

const getKeycloakConfig = memoize(
  async () => {
    const issuerUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}`;
    console.log('Discovering Keycloak issuer at:', issuerUrl);

    return {
      issuer: issuerUrl,
      authorizationURL: `${issuerUrl}/protocol/openid-connect/auth`,
      tokenURL: `${issuerUrl}/protocol/openid-connect/token`,
      userInfoURL: `${issuerUrl}/protocol/openid-connect/userinfo`,
      clientID: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/auth/callback`,
    };
  },
  { maxAge: 3600 * 1000 },
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: 'sessions',
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

interface KeycloakUser {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  realm_access?: {
    roles: string[];
  };
}

async function upsertUser(keycloakUser: KeycloakUser) {
  try {
    // Determine role from Keycloak roles
    const roles = keycloakUser.realm_access?.roles || [];
    let role = 'user'; // default

    if (roles.includes('super_admin')) {
      role = 'super_admin';
    } else if (roles.includes('event_admin')) {
      role = 'event_admin';
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.keycloakId, keycloakUser.sub))
      .limit(1);

    if (existingUser.length > 0) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          email: keycloakUser.email,
          firstName: keycloakUser.given_name,
          lastName: keycloakUser.family_name,
          profileImageUrl: keycloakUser.picture,
          role,
          updatedAt: new Date(),
        })
        .where(eq(users.keycloakId, keycloakUser.sub))
        .returning();

      return updatedUser;
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          keycloakId: keycloakUser.sub,
          email: keycloakUser.email,
          firstName: keycloakUser.given_name,
          lastName: keycloakUser.family_name,
          profileImageUrl: keycloakUser.picture,
          role,
          status: 'active',
        })
        .returning();

      return newUser;
    }
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}

export async function setupKeycloakAuth(app: any) {
  app.set('trust proxy', 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getKeycloakConfig();

  const strategy = new OpenIDConnectStrategy(
    {
      issuer: config.issuer,
      authorizationURL: config.authorizationURL,
      tokenURL: config.tokenURL,
      userInfoURL: config.userInfoURL,
      clientID: config.clientID,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackURL,
      scope: 'openid email profile',
    },
    async (issuer: string, profile: any, done: any) => {
      try {
        const user = await upsertUser(profile._json);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  );

  passport.use('openidconnect', strategy);

  passport.serializeUser((user: any, done: any) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done: any) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Auth routes
  app.get('/api/auth/login', passport.authenticate('openidconnect'));

  app.get(
    '/api/auth/callback',
    passport.authenticate('openidconnect', {
      successRedirect: '/',
      failureRedirect: '/login?error=auth_failed',
    }),
  );

  // ...existing code...
  app.get('/api/auth/logout', (req: any, res: any) => {
    const logoutUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`;
    const redirectUri = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/`,
    );

    if (typeof req.logout === 'function') {
      req.logout(() => {
        if (typeof res.redirect === 'function') {
          res.redirect(`${logoutUrl}?redirect_uri=${redirectUri}`);
        } else {
          res.status(200).send('Logged out');
        }
      });
    } else {
      if (typeof res.redirect === 'function') {
        res.redirect(`${logoutUrl}?redirect_uri=${redirectUri}`);
      } else {
        res.status(200).send('Logged out');
      }
    }
  });
}

// Middleware to require authentication (no explicit Express types)
export const requireAuth = (req: any, res: any, next: any) => {
  if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware to require a specific role (no explicit Express types)
export const requireRole = (role: string) => {
  return (req: any, res: any, next: any) => {
    if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user;
    if (!user || user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to require one of several roles (no explicit Express types)
export const requireRoles = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
