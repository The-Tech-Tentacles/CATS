# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S cats -u 1001

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs && \
    chown -R cats:nodejs /app

# Copy application code
COPY --chown=cats:nodejs . .

# Remove development files
RUN rm -rf tests/ docs/ .git/ .env.example

# Switch to non-root user
USER cats

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["npm", "start"]