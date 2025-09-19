import { z } from 'zod';

// Common validation schemas
export const idSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const nameSchema = z.string().min(1).max(100);

// Team validation schemas
export const createTeamSchema = z.object({
  name: nameSchema,
  description: z.string().max(500).optional(),
  maxMembers: z.number().int().min(2).max(10),
  captainId: idSchema,
  eventId: idSchema,
});

export const joinTeamSchema = z.object({
  inviteCode: z.string().min(6).max(10),
  userId: idSchema,
});

// Award validation schemas
export const createAwardSchema = z.object({
  name: nameSchema,
  description: z.string().max(500).optional(),
  type: z.enum(['trophy', 'medal', 'certificate', 'badge']),
  position: z.number().int().min(1).optional(),
  category: z.string().max(100).optional(),
  eventId: idSchema,
});

export const awardRecipientSchema = z
  .object({
    userId: idSchema.optional(),
    teamId: idSchema.optional(),
  })
  .refine((data) => data.userId || data.teamId, {
    message: 'Either userId or teamId must be provided',
  });

// Tournament validation schemas
export const createTournamentSchema = z.object({
  name: nameSchema,
  format: z.enum(['knockout', 'league', 'swiss']),
  maxParticipants: z.number().int().min(4).max(128),
  eventId: idSchema,
});

export const completeMatchSchema = z.object({
  winnerId: idSchema,
  score: z.record(z.string(), z.any()).optional(),
});

// Communication validation schemas
export const createCommunicationSchema = z.object({
  title: nameSchema,
  content: z.string().min(1).max(10000),
  type: z.enum(['email', 'sms', 'push']),
  targetAudience: z.enum(['all', 'registered', 'teams', 'organizers']),
  scheduledFor: z.string().datetime().optional(),
  eventId: idSchema,
});

// Export validation schemas
export const createExportSchema = z.object({
  type: z.enum(['attendees', 'payments', 'analytics', 'certificates']),
  format: z.enum(['csv', 'xlsx', 'pdf']),
  filters: z.record(z.string(), z.any()).optional(),
  includeFields: z.array(z.string()).optional(),
  eventId: idSchema,
});
