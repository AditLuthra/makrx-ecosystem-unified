import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import ws from 'ws';
import * as schema from '@shared/schema';

// Configure Neon for serverless environments (WebSocket for Node)
neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket;

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL must be set. Did you forget to provision a database?',
  );
}

// Use Neon HTTP client with Drizzle
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
