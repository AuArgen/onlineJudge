# Use slim image (Debian based) instead of alpine to avoid glibc/musl issues with SWC
FROM node:20-slim

WORKDIR /app

COPY package*.json ./

# Clean install dependencies
RUN rm -rf package-lock.json node_modules

# Increase timeout and use default registry
RUN npm config set fetch-retry-maxtimeout 600000 \
    && npm config set fetch-retry-mintimeout 10000 \
    && npm install

# Copy the source code
COPY . .

# Build Next.js app
# We rely on docker-compose shm_size: '2gb' to avoid Bus Error
RUN npm run build

EXPOSE 3000

#CMD ["npm", "start"]
CMD ["npx", "next", "start", "-H", "0.0.0.0"]