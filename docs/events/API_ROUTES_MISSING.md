# Missing API Routes - MakrX.events

This document lists all the API endpoints that need to be implemented to support the frontend components.

## 🔍 Current Implementation Status

### ✅ Existing API Routes
- `/api/events` - Event CRUD operations
- `/api/events/[eventId]/register` - Event registration
- `/api/events/[eventId]/check-ins` - Check-in management
- `/api/events/[eventId]/sessions` - Session management
- `/api/events/[eventId]/dashboard` - Analytics dashboard
- `/api/sponsors` - Sponsor management
- `/api/auth/user` - User authentication
- `/api/my-registrations` - User registrations

### ❌ Missing API Routes

## 1. Team Management APIs

### Teams Base Routes
```
GET    /api/events/[eventId]/teams
POST   /api/events/[eventId]/teams
GET    /api/events/[eventId]/teams/[teamId]
PATCH  /api/events/[eventId]/teams/[teamId]
DELETE /api/events/[eventId]/teams/[teamId]
```

### Team Actions
```
POST   /api/events/[eventId]/teams/join
POST   /api/events/[eventId]/teams/[teamId]/leave
DELETE /api/events/[eventId]/teams/[teamId]/members/[memberId]
GET    /api/events/[eventId]/teams/user/[userId]
```

**Required by:** `components/team-manager.tsx`

**Expected Data:**
```typescript
interface Team {
  id: string;
  name: string;
  description: string;
  maxMembers: number;
  captainId: string;
  status: string;
  inviteCode: string;
  members: TeamMember[];
}

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}
```

---

## 2. Tournament & Bracket APIs

### Tournament Management
```
GET    /api/tournaments/[tournamentId]
POST   /api/tournaments
PATCH  /api/tournaments/[tournamentId]
DELETE /api/tournaments/[tournamentId]
```

### Match Management
```
POST   /api/tournaments/[tournamentId]/matches/[matchId]/start
POST   /api/tournaments/[tournamentId]/matches/[matchId]/complete
GET    /api/tournaments/[tournamentId]/matches
```

### Participants
```
GET    /api/tournaments/[tournamentId]/participants
POST   /api/tournaments/[tournamentId]/participants
DELETE /api/tournaments/[tournamentId]/participants/[participantId]
```

**Required by:** `components/tournament-bracket.tsx`

**Expected Data:**
```typescript
interface Tournament {
  id: string;
  name: string;
  format: string;
  status: string;
  maxParticipants: number;
  currentRound: number;
  participants: TournamentParticipant[];
  rounds: TournamentRound[];
}

interface Match {
  id: string;
  matchNumber: number;
  participant1?: TournamentParticipant;
  participant2?: TournamentParticipant;
  winner?: TournamentParticipant;
  status: string;
  score?: any;
}
```

---

## 3. Leaderboard APIs

### Leaderboard Management
```
GET    /api/events/[eventId]/leaderboards
POST   /api/events/[eventId]/leaderboards
GET    /api/events/[eventId]/leaderboards/[leaderboardId]
PATCH  /api/events/[eventId]/leaderboards/[leaderboardId]
```

### Leaderboard Entries
```
GET    /api/events/[eventId]/leaderboards/[leaderboardId]/entries
POST   /api/events/[eventId]/leaderboards/[leaderboardId]/entries
PATCH  /api/events/[eventId]/leaderboards/[leaderboardId]/entries/[entryId]
```

**Required by:** `components/leaderboard.tsx`

**Expected Data:**
```typescript
interface Leaderboard {
  id: string;
  name: string;
  type: string;
  scoringMethod: string;
  isLive: boolean;
  entries: LeaderboardEntry[];
}

interface LeaderboardEntry {
  id: string;
  position: number;
  score: number;
  wins: number;
  losses: number;
  points: number;
  user?: User;
  team?: Team;
}
```

---

## 4. Awards & Certificates APIs

### Awards Management
```
GET    /api/events/[eventId]/awards
POST   /api/events/[eventId]/awards
GET    /api/events/[eventId]/awards/[awardId]
PATCH  /api/events/[eventId]/awards/[awardId]
DELETE /api/events/[eventId]/awards/[awardId]
```

### Award Recipients
```
GET    /api/events/[eventId]/awards/[awardId]/recipients
POST   /api/events/[eventId]/awards/[awardId]/recipients
DELETE /api/events/[eventId]/awards/[awardId]/recipients/[recipientId]
```

### Certificate Generation
```
POST   /api/events/[eventId]/awards/[awardId]/certificate/[recipientId]
GET    /api/events/[eventId]/awards/[awardId]/certificate/[recipientId]/download
```

### Participants List
```
GET    /api/events/[eventId]/participants
```

**Required by:** `components/awards-manager.tsx`

**Expected Data:**
```typescript
interface Award {
  id: string;
  name: string;
  description: string;
  type: string;
  position?: number;
  category?: string;
  recipients: AwardRecipient[];
}

interface AwardRecipient {
  id: string;
  userId?: string;
  teamId?: string;
  certificateUrl?: string;
  issuedAt: string;
  user?: User;
  team?: Team;
}
```

---

## 5. Bulk Communications APIs

### Communication Campaigns
```
GET    /api/events/[eventId]/bulk-communications
POST   /api/events/[eventId]/bulk-communications
GET    /api/events/[eventId]/bulk-communications/[campaignId]
PATCH  /api/events/[eventId]/bulk-communications/[campaignId]
DELETE /api/events/[eventId]/bulk-communications/[campaignId]
```

### Campaign Actions
```
POST   /api/events/[eventId]/bulk-communications/[campaignId]/send
POST   /api/events/[eventId]/bulk-communications/[campaignId]/schedule
POST   /api/events/[eventId]/bulk-communications/[campaignId]/cancel
```

### Audience & Templates
```
GET    /api/events/[eventId]/audience-stats
GET    /api/email-templates
POST   /api/email-templates
```

**Required by:** `components/bulk-email-manager.tsx`

**Expected Data:**
```typescript
interface BulkCommunication {
  id: string;
  title: string;
  content: string;
  type: string;
  targetAudience: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  type: string;
  isActive: boolean;
}
```

---

## 6. Export Management APIs

### Export Jobs
```
GET    /api/events/[eventId]/exports
POST   /api/events/[eventId]/exports
GET    /api/events/[eventId]/exports/[exportId]
DELETE /api/events/[eventId]/exports/[exportId]
```

### Export Statistics
```
GET    /api/events/[eventId]/export-stats
```

**Required by:** `components/export-manager.tsx`

**Expected Data:**
```typescript
interface ExportJob {
  id: string;
  type: string;
  format: string;
  status: string;
  fileUrl?: string;
  fileSize?: number;
  recordCount?: number;
  error?: string;
  expiresAt?: string;
  createdAt: string;
}
```

---

## 7. Event Templates APIs

### Template Management
```
GET    /api/event-templates
POST   /api/event-templates
GET    /api/event-templates/[templateId]
PATCH  /api/event-templates/[templateId]
DELETE /api/event-templates/[templateId]
```

### Template Actions
```
POST   /api/event-templates/[templateId]/use
POST   /api/events/[eventId]/save-template
GET    /api/my-events
```

**Required by:** `components/event-templates.tsx`

**Expected Data:**
```typescript
interface EventTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  templateData: any;
  isPublic: boolean;
  usageCount: number;
  tags?: string[];
  creator?: User;
}
```

---

## 8. Permissions Management APIs

### Event Roles
```
GET    /api/events/[eventId]/roles
POST   /api/events/[eventId]/roles
GET    /api/events/[eventId]/roles/[roleId]
PATCH  /api/events/[eventId]/roles/[roleId]
DELETE /api/events/[eventId]/roles/[roleId]
```

### Available Users
```
GET    /api/events/[eventId]/available-users
```

**Required by:** `components/permissions-manager.tsx`

**Expected Data:**
```typescript
interface EventRole {
  id: string;
  userId: string;
  role: string;
  permissions: string[];
  assignedBy: string;
  assignedAt: string;
  isActive: boolean;
  user: User;
}
```

---

## 9. Payment APIs (Razorpay Integration)

### Payment Orders
```
POST   /api/payments/create-order
POST   /api/payments/verify
GET    /api/payments/[paymentId]
```

**Required by:** `components/payment-checkout.tsx`

**Expected Data:**
```typescript
interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  razorpay_order_id: string;
}
```

---

## 📋 Implementation Priority

### High Priority (Core Features)
1. **Team Management APIs** - Essential for team-based events
2. **Awards APIs** - Critical for competition recognition
3. **Payment APIs** - Required for paid events

### Medium Priority (Enhanced Features)  
4. **Leaderboard APIs** - Important for live competitions
5. **Tournament APIs** - Needed for bracket management
6. **Export APIs** - Valuable for organizers

### Lower Priority (Advanced Features)
7. **Bulk Communication APIs** - Nice to have for large events
8. **Template APIs** - Efficiency feature for repeat organizers
9. **Permissions APIs** - Advanced role management

## 🚧 Database Schema Requirements

### New Tables Needed
```sql
-- Teams and members
CREATE TABLE teams (...);
CREATE TABLE team_members (...);

-- Tournaments and matches
CREATE TABLE tournaments (...);
CREATE TABLE tournament_participants (...);
CREATE TABLE tournament_rounds (...);
CREATE TABLE matches (...);

-- Leaderboards and scoring
CREATE TABLE leaderboards (...);
CREATE TABLE leaderboard_entries (...);

-- Awards and certificates
CREATE TABLE awards (...);
CREATE TABLE award_recipients (...);

-- Communication system
CREATE TABLE bulk_communications (...);
CREATE TABLE email_templates (...);
CREATE TABLE email_queue (...);

-- Export system
CREATE TABLE export_jobs (...);

-- Template system
CREATE TABLE event_templates (...);

-- Permission system
CREATE TABLE event_roles (...);

-- Payment tracking
CREATE TABLE payment_transactions (...);
```

## 🔧 Next Steps

1. **Create missing database tables** using Drizzle schema
2. **Implement high-priority API routes** first
3. **Add proper authentication middleware** to protected routes
4. **Implement input validation** using Zod schemas
5. **Add error handling** and consistent error responses
6. **Create background job processing** for exports and emails
7. **Add comprehensive testing** for all new endpoints

## 📞 Implementation Support

Refer to `IMPLEMENTATION.md` for detailed code examples and implementation guidance for each API endpoint.