# Build stage
FROM node:22.14.0-alpine AS build

WORKDIR /frontend

# Copy package files
COPY package.json package-lock.json vite.config.mjs ./

# Install deps including 'serve' locally
RUN npm install
RUN npm install serve

# Copy rest of the app
COPY . .

# Build the Vite project
RUN npm run build

# Runtime stage
FROM node:22.14.0-alpine AS runtime

WORKDIR /app

# Copy built app and node_modules with serve
COPY --from=build /frontend/dist /app
COPY --from=build /frontend/node_modules /app/node_modules
COPY --from=build /frontend/package.json /app/package.json

# Expose the port
EXPOSE 5174

# Use serve from node_modules
CMD ["node_modules/.bin/serve", "-s", ".", "-l", "5174"]
