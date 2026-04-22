FROM node:20-slim AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

# Build the server (assuming it's using tsc or similar)
RUN pnpm build

FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle ./drizzle

RUN npm install -g pnpm

EXPOSE 5000

CMD ["pnpm", "start"]
