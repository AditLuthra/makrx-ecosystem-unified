FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps apps
COPY packages packages
RUN npm ci --legacy-peer-deps
RUN npm run build --workspace=apps/makrx-events

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/makrx-events/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/makrx-events/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/makrx-events/.next/static ./.next/static

USER nextjs
EXPOSE 3004
ENV PORT=3004
CMD ["node", "server.js"]
