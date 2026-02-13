FROM oven/bun:1-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production

ARG PUBLIC_APP_URL
ENV PUBLIC_APP_URL=${PUBLIC_APP_URL}

RUN bun run build:server
RUN bun run build:public

FROM oven/bun:1-alpine

RUN apk add --no-cache curl tar gzip

WORKDIR /app

COPY --from=build /app/server server
COPY --from=build /app/public public

ENV NODE_ENV=production

CMD ["./server"]