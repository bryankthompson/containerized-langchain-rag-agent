FROM node:18-slim

WORKDIR /app

# Install dependencies needed for @xenova/transformers and build tools
RUN apt-get update && \
    apt-get install -y python3 python3-pip build-essential wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create logs directory
RUN mkdir -p logs

# Copy package files
COPY package*.json ./

# Install all dependencies including optionals 
RUN npm install

# Copy source code and config files
COPY tsconfig.json ./
COPY src/ ./src/

# Transpile TypeScript to JavaScript
RUN npx tsc --skipLibCheck

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Expose the port
EXPOSE 8000

# Start the server with explicit ESM support
CMD ["node", "--experimental-specifier-resolution=node", "build/server.js"]
