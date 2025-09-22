FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps apps
COPY packages packages
COPY tsconfig.base.json ./
RUN npm ci --legacy-peer-deps
RUN npm run build --workspace=apps/gateway-frontend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/gateway-frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/gateway-frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/gateway-frontend/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
