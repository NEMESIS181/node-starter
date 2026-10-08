FROM node:24-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Development
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# Production
FROM base AS prod
ENV NODE_ENV=production
RUN npm ci --omit=dev && npm cache clean --force
COPY . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]
