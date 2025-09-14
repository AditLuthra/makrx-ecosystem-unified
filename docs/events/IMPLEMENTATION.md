# Implementation Guide - MakrX.events

This guide covers implementing and extending MakrX.events features, including missing API endpoints and integration details.

## 🏗️ Architecture Overview

### Frontend Architecture
```
app/
├── (auth)/              # Authentication pages
├── dashboard/           # User dashboard  
├── events/             # Event management
│   ├── [eventId]/     # Event details
│   │   ├── teams/     # Team management
│   │   ├── brackets/  # Tournament brackets
│   │   └── awards/    # Awards system
│   └── create/        # Event creation
└── api/               # API routes
```

### Component Architecture
```
components/
├── ui/                    # Base UI components (shadcn)
├── team-manager.tsx       # Team formation & management
├── tournament-bracket.tsx # Tournament brackets  
├── leaderboard.tsx        # Live leaderboards
├── awards-manager.tsx     # Awards & certificates
├── bulk-email-manager.tsx # Communication system
├── export-manager.tsx     # Data export
├── event-templates.tsx    # Template system
└── permissions-manager.tsx # Role management
```

## 🚧 Missing API Implementations

### 1. Team Management APIs

#### Create Team API
```typescript
// app/api/events/[eventId]/teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, teamMembers } from '@shared/schema';
import { nanoid } from 'nanoid';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventTeams = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        maxMembers: teams.maxMembers,
        captainId: teams.captainId,
        status: teams.status,
        inviteCode: teams.inviteCode,
        createdAt: teams.createdAt,
        members: /* Add join for team members */
      })
      .from(teams)
      .where(eq(teams.eventId, params.eventId))
      .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId));

    return NextResponse.json(eventTeams);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch teams' }, 
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { name, description, maxMembers, captainId } = await request.json();
    
    const inviteCode = nanoid(8);
    
    const [team] = await db
      .insert(teams)
      .values({
        eventId: params.eventId,
        name,
        description,
        maxMembers,
        captainId,
        inviteCode,
        status: 'forming',
      })
      .returning();

    // Add captain as first member
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: captainId,
      role: 'captain',
      status: 'active',
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create team' }, 
      { status: 500 }
    );
  }
}
```

#### Join Team API
```typescript
// app/api/events/[eventId]/teams/join/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { inviteCode, userId } = await request.json();
    
    // Find team by invite code
    const [team] = await db
      .select()
      .from(teams)
      .where(
        and(
          eq(teams.eventId, params.eventId),
          eq(teams.inviteCode, inviteCode)
        )
      )
      .limit(1);

    if (!team) {
      return NextResponse.json(
        { error: 'Invalid invite code' }, 
        { status: 404 }
      );
    }

    // Check if team is full
    const memberCount = await db
      .select({ count: count() })
      .from(teamMembers)
      .where(eq(teamMembers.teamId, team.id));

    if (memberCount[0].count >= team.maxMembers) {
      return NextResponse.json(
        { error: 'Team is full' }, 
        { status: 400 }
      );
    }

    // Add member to team
    const [member] = await db
      .insert(teamMembers)
      .values({
        teamId: team.id,
        userId,
        role: 'member',
        status: 'active',
      })
      .returning();

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to join team' }, 
      { status: 500 }
    );
  }
}
```

### 2. Tournament Bracket APIs

#### Tournament Management
```typescript
// app/api/tournaments/[tournamentId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const tournament = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        format: tournaments.format,
        status: tournaments.status,
        maxParticipants: tournaments.maxParticipants,
        currentRound: tournaments.currentRound,
        participants: /* Join participants */,
        rounds: /* Join rounds and matches */
      })
      .from(tournaments)
      .where(eq(tournaments.id, params.tournamentId))
      .leftJoin(tournamentParticipants, eq(tournaments.id, tournamentParticipants.tournamentId))
      .leftJoin(tournamentRounds, eq(tournaments.id, tournamentRounds.tournamentId));

    return NextResponse.json(tournament[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tournament' }, 
      { status: 500 }
    );
  }
}
```

#### Match Management
```typescript
// app/api/tournaments/[tournamentId]/matches/[matchId]/start/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { tournamentId: string; matchId: string } }
) {
  try {
    const [match] = await db
      .update(matches)
      .set({
        status: 'in_progress',
        startedAt: new Date(),
      })
      .where(eq(matches.id, params.matchId))
      .returning();

    return NextResponse.json(match);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start match' }, 
      { status: 500 }
    );
  }
}

// app/api/tournaments/[tournamentId]/matches/[matchId]/complete/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { tournamentId: string; matchId: string } }
) {
  try {
    const { winnerId, score } = await request.json();
    
    const [match] = await db
      .update(matches)
      .set({
        status: 'completed',
        winnerId,
        score,
        completedAt: new Date(),
      })
      .where(eq(matches.id, params.matchId))
      .returning();

    // Update leaderboards
    await updateLeaderboardsForMatch(match);
    
    // Advance winner to next round if applicable
    await advanceWinnerToNextRound(match);

    return NextResponse.json(match);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to complete match' }, 
      { status: 500 }
    );
  }
}
```

### 3. Leaderboard APIs

```typescript
// app/api/events/[eventId]/leaderboards/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overall';
    const tournamentId = searchParams.get('tournamentId');

    let conditions = [eq(leaderboards.eventId, params.eventId)];
    
    if (type !== 'overall') {
      conditions.push(eq(leaderboards.type, type));
    }
    
    if (tournamentId) {
      conditions.push(eq(leaderboards.tournamentId, tournamentId));
    }

    const leaderboardData = await db
      .select({
        id: leaderboards.id,
        name: leaderboards.name,
        type: leaderboards.type,
        scoringMethod: leaderboards.scoringMethod,
        isLive: leaderboards.isLive,
        entries: /* Join leaderboard entries with users/teams */
      })
      .from(leaderboards)
      .where(and(...conditions))
      .leftJoin(leaderboardEntries, eq(leaderboards.id, leaderboardEntries.leaderboardId))
      .orderBy(leaderboardEntries.position);

    return NextResponse.json(leaderboardData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboards' }, 
      { status: 500 }
    );
  }
}
```

### 4. Awards & Certificates APIs

```typescript
// app/api/events/[eventId]/awards/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventAwards = await db
      .select({
        id: awards.id,
        name: awards.name,
        description: awards.description,
        type: awards.type,
        position: awards.position,
        category: awards.category,
        recipients: /* Join award recipients */
      })
      .from(awards)
      .where(eq(awards.eventId, params.eventId))
      .leftJoin(awardRecipients, eq(awards.id, awardRecipients.awardId));

    return NextResponse.json(eventAwards);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch awards' }, 
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const awardData = await request.json();
    
    const [award] = await db
      .insert(awards)
      .values({
        eventId: params.eventId,
        ...awardData,
      })
      .returning();

    return NextResponse.json(award, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create award' }, 
      { status: 500 }
    );
  }
}
```

#### Certificate Generation
```typescript
// app/api/events/[eventId]/awards/[awardId]/certificate/[recipientId]/route.ts
import { generateCertificatePDF } from '@/lib/certificate-generator';

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string; awardId: string; recipientId: string } }
) {
  try {
    // Get award and recipient details
    const awardDetails = await getAwardAndRecipientDetails(
      params.awardId, 
      params.recipientId
    );
    
    // Generate certificate PDF
    const certificateUrl = await generateCertificatePDF(awardDetails);
    
    // Update recipient record with certificate URL
    await db
      .update(awardRecipients)
      .set({ certificateUrl })
      .where(eq(awardRecipients.id, params.recipientId));

    return NextResponse.json({ certificateUrl });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate certificate' }, 
      { status: 500 }
    );
  }
}
```

### 5. Bulk Communication APIs

```typescript
// app/api/events/[eventId]/bulk-communications/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const communications = await db
      .select()
      .from(bulkCommunications)
      .where(eq(bulkCommunications.eventId, params.eventId))
      .orderBy(desc(bulkCommunications.createdAt));

    return NextResponse.json(communications);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch communications' }, 
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const campaignData = await request.json();
    
    const [campaign] = await db
      .insert(bulkCommunications)
      .values({
        eventId: params.eventId,
        ...campaignData,
        status: campaignData.scheduledFor ? 'scheduled' : 'draft',
      })
      .returning();

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create campaign' }, 
      { status: 500 }
    );
  }
}
```

### 6. Export Management APIs

```typescript
// app/api/events/[eventId]/exports/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { type, format, filters, includeFields } = await request.json();
    
    const [exportJob] = await db
      .insert(exportJobs)
      .values({
        eventId: params.eventId,
        type,
        format,
        filters,
        includeFields,
        status: 'queued',
      })
      .returning();

    // Queue background job for processing
    await queueExportJob(exportJob.id);

    return NextResponse.json(exportJob, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create export' }, 
      { status: 500 }
    );
  }
}
```

## 📊 Database Schema Extensions

### Missing Tables to Add

```typescript
// Add to shared/schema.ts

// Teams
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  name: varchar("name").notNull(),
  description: text("description"),
  maxMembers: integer("max_members").notNull().default(4),
  captainId: varchar("captain_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("forming"), // forming, ready, competing, eliminated
  inviteCode: varchar("invite_code").notNull().unique(),
  avatar: varchar("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").notNull().default("member"), // captain, member
  status: varchar("status").notNull().default("active"), // active, inactive
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Tournaments  
export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  name: varchar("name").notNull(),
  format: varchar("format").notNull().default("knockout"), // knockout, league, swiss
  status: varchar("status").notNull().default("draft"), // draft, active, completed
  maxParticipants: integer("max_participants").notNull(),
  currentRound: integer("current_round").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournamentParticipants = pgTable("tournament_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  userId: varchar("user_id").references(() => users.id),
  teamId: varchar("team_id").references(() => teams.id),
  seed: integer("seed"),
  status: varchar("status").notNull().default("active"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Leaderboards
export const leaderboards = pgTable("leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull().default("tournament"), // tournament, activity, overall
  scoringMethod: varchar("scoring_method").notNull().default("wins"), // wins, points, time
  isLive: boolean("is_live").default(true),
  displayPublic: boolean("display_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leaderboardId: varchar("leaderboard_id").notNull().references(() => leaderboards.id),
  userId: varchar("user_id").references(() => users.id),
  teamId: varchar("team_id").references(() => teams.id),
  position: integer("position").notNull(),
  score: decimal("score", { precision: 10, scale: 2 }).default("0"),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  draws: integer("draws").default(0),
  points: integer("points").default(0),
  stats: jsonb("stats"), // Additional stats as JSON
  lastUpdated: timestamp("last_updated").defaultNow(),
});
```

## 🔧 Service Implementations

### Email Service Integration

```typescript
// lib/email-service.ts (Complete implementation)
import { sendEmail } from '@sendgrid/mail';
import { db } from './db';
import { emailTemplates, emailQueue } from '@shared/schema';

export class EmailService {
  async sendRegistrationConfirmation(to: string, data: any) {
    const template = await this.getTemplate('registration_confirmation');
    const html = this.renderTemplate(template.htmlContent, data);
    
    return await this.queueEmail({
      to,
      subject: template.subject,
      html,
      templateId: template.id,
    });
  }

  async sendBulkCommunication(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);
    const recipients = await this.getRecipients(campaign.targetAudience, campaign.filters);
    
    for (const recipient of recipients) {
      await this.queueEmail({
        to: recipient.email,
        subject: campaign.title,
        html: this.personalizeContent(campaign.content, recipient),
        campaignId,
      });
    }
  }

  private async queueEmail(emailData: any) {
    return await db.insert(emailQueue).values(emailData);
  }

  private renderTemplate(template: string, data: any) {
    // Replace variables like {{firstName}} with actual data
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
  }
}
```

### Payment Service Integration

```typescript
// lib/payment-service.ts (Razorpay implementation)
import Razorpay from 'razorpay';

export class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(amount: number, currency = 'INR', notes = {}) {
    return await this.razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      notes,
    });
  }

  async verifySignature(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');
    
    return generatedSignature === razorpay_signature;
  }
}
```

## 🚀 Deployment Steps

### 1. Database Migration
```bash
# Ensure database is up to date
npm run db:push --force
```

### 2. Missing API Routes Implementation
Create all the missing API route files as shown above.

### 3. Environment Variables
Add required environment variables:
```bash
# Payment processing
VITE_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-secret

# Email service
SENDGRID_API_KEY=SG.your-key
SMTP_FROM=noreply@yourdomain.com

# File storage (for certificates/exports)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=makrx-files
```

### 4. Background Job Processing
```typescript
// lib/queue-processor.ts
export class QueueProcessor {
  async processEmailQueue() {
    const pendingEmails = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.status, 'pending'))
      .limit(10);

    for (const email of pendingEmails) {
      await this.sendEmail(email);
    }
  }

  async processExportJobs() {
    const pendingExports = await db
      .select()
      .from(exportJobs)
      .where(eq(exportJobs.status, 'queued'))
      .limit(5);

    for (const exportJob of pendingExports) {
      await this.generateExport(exportJob);
    }
  }
}
```

## 📋 Testing Implementation

### API Testing
```typescript
// __tests__/api/teams.test.ts
import { POST } from '@/app/api/events/[eventId]/teams/route';
import { mockDatabase } from '../utils/mock-db';

describe('/api/events/[eventId]/teams', () => {
  beforeEach(() => {
    mockDatabase.reset();
  });

  it('should create a new team', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Team',
        description: 'A test team',
        maxMembers: 4,
        captainId: 'user-123',
      }),
    });

    const response = await POST(request, { params: { eventId: 'event-123' } });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('Test Team');
    expect(data.inviteCode).toBeDefined();
  });
});
```

### Component Testing
```typescript
// __tests__/components/team-manager.test.tsx
import { render, screen } from '@testing-library/react';
import { TeamManager } from '@/components/team-manager';

describe('TeamManager', () => {
  it('should render team creation form', () => {
    render(<TeamManager eventId="event-123" userId="user-123" canManage={true} />);
    
    expect(screen.getByText('Team Management')).toBeInTheDocument();
    expect(screen.getByText('Create Team')).toBeInTheDocument();
  });
});
```

## 🔧 Integration Checklist

- [ ] **Database Schema** - All new tables added and migrated
- [ ] **API Routes** - All missing endpoints implemented
- [ ] **Authentication** - Protected routes have auth middleware
- [ ] **Validation** - Input validation with Zod schemas
- [ ] **Error Handling** - Consistent error responses
- [ ] **Email Service** - SendGrid integration working
- [ ] **Payment Service** - Razorpay integration working
- [ ] **File Storage** - Certificate and export file handling
- [ ] **Background Jobs** - Queue processing for emails and exports
- [ ] **Testing** - API and component tests added
- [ ] **Documentation** - API documentation updated

## 🆘 Support

For implementation support:
- 📧 Email: dev@makrx.events  
- 💬 Discord: [MakrX Developers](https://discord.gg/makrx-dev)
- 📚 Docs: [docs.makrx.events/api](https://docs.makrx.events/api)