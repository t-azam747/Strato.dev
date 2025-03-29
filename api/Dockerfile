# Use Bun as the base image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy package.json, bun.lockb, and install dependencies
COPY package.json bun.lockb ./
RUN bun install

# Copy the rest of the app
COPY . .

# Expose the port (same as the one in .env)
EXPOSE ${PORT}

# Start the server
CMD ["bun", "run", "server.ts"]
