# Build stage
FROM node:18-alpine as builder

# Install dependencies for building
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the Strapi application
RUN npm run build

# Production stage
FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache vips-dev

# Set working directory
WORKDIR /app

# Copy built assets from the builder stage
COPY --from=builder /app ./

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the Strapi port
EXPOSE 1337

# Start Strapi
CMD ["npm", "run", "start"]
