FROM node:20-slim

WORKDIR /app

# curl is used by docker-compose healthchecks
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies (npm lockfile — matches local development)
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source
COPY . .

# Build frontend (Vite) + bundle server (esbuild)
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
