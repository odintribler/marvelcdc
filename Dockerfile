# Use specific Node.js version that satisfies Nuxt 4 requirements
FROM node:22.12.0-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm ci --only=production && npm cache clean --force

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]