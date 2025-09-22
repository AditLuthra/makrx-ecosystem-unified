FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps apps
COPY packages packages
COPY tsconfig.base.json ./
RUN npm ci --legacy-peer-deps
RUN npm run build --workspace=apps/gateway-frontend-hacker

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/gateway-frontend-hacker/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/gateway-frontend-hacker/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/gateway-frontend-hacker/.next/static ./.next/static

USER nextjs
EXPOSE 3001
ENV PORT=3001
CMD ["node", "server.js"]
