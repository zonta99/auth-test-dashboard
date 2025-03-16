# auth-test-dashboard/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage cache
COPY package*.json ./

# Install dependencies
RUN npm install -g bun && bun install

# Copy only what's needed for the build
COPY jsconfig.json ./
COPY public ./public
COPY components.json ./
COPY next.config.mjs ./
COPY postcss.config.mjs ./


# These will change frequently, so copy them last
COPY app ./app
COPY components ./components
COPY lib ./lib

# Build the application
RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]