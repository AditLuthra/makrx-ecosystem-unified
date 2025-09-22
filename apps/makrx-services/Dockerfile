FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps apps
COPY packages packages
COPY tsconfig.base.json ./
RUN npm ci --legacy-peer-deps
RUN npm run build --workspace=apps/makrx-services

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/makrx-services/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/makrx-services/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/makrx-services/.next/static ./.next/static

USER nextjs
EXPOSE 3005
ENV PORT=3005
CMD ["node", "server.js"]
