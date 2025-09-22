FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps apps
COPY packages packages
COPY tsconfig.base.json ./
RUN npm ci --legacy-peer-deps
RUN npm run build --workspace=apps/makrx-store

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/makrx-store/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/makrx-store/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/makrx-store/.next/static ./.next/static

USER nextjs
EXPOSE 3003
ENV PORT=3003
CMD ["node", "server.js"]
