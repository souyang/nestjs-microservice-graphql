# Use Node.js base image
FROM node:22

# Set working directory at the monorepo root
WORKDIR /app

# Copy the monorepo's root package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies for the entire monorepo
RUN npm install

# Copy only the service-specific source files
COPY ./apps/auth ./apps/auth

# Set working directory for the specific service
WORKDIR /app/apps/auth

# Expose the service port
EXPOSE 4002

# Run the service using the monorepo's shared dependencies
CMD ["npm", "run", "start:dev"]
