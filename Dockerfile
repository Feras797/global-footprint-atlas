# Multi-stage Docker build for production deployment
FROM node:22.15.0-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22.15.0-alpine as production

# Install Google Cloud SDK
RUN apk add --no-cache curl python3 py3-pip
RUN curl https://sdk.cloud.google.com | bash
ENV PATH="/root/google-cloud-sdk/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application and server
COPY --from=builder /app/dist ./dist
COPY server.js ./
COPY --from=builder /app/node_modules ./node_modules

# Expose ports
EXPOSE 3001 8080

# Create startup script
RUN echo '#!/bin/sh\n\
# Authenticate with Google Cloud (assumes service account key is mounted)\n\
if [ -f "/app/gcloud-key.json" ]; then\n\
  gcloud auth activate-service-account --key-file=/app/gcloud-key.json\n\
fi\n\
\n\
# Start proxy server in background\n\
node server.js &\n\
\n\
# Serve the built frontend\n\
npx serve -s dist -l 8080\n\
' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
