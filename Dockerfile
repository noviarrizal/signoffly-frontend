# syntax=docker/dockerfile:1.7
#
# The website as a small self-contained Node server (Next.js "standalone" output).
#
#   docker build -t signoffly-frontend .
#
# Nothing secret is built in. Every setting is read when the container starts (AUTH_SECRET, GO_API_URL,
# INTERNAL_SERVICE_SECRET, API_TOKEN_PRIVATE_KEY, LEGAL_OPERATOR_NAME, SITE_URL and the rest, see .env.example), so one
# image works for any address and nobody has to rebuild it to change the operator name.

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS deps
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app
# package.json pins the pnpm version (packageManager), and corepack uses it.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:${NODE_VERSION}-bookworm-slim AS build
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1 NEXT_OUTPUT=standalone
RUN corepack enable
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The fonts are downloaded from Google while building, so the build needs the internet.
RUN pnpm build

FROM node:${NODE_VERSION}-bookworm-slim AS run
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
# /robots.txt is answered by the website itself and does not call the API, so a slow API cannot make the site look dead.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
