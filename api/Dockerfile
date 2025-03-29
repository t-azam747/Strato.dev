FROM oven/bun:latest
WORKDIR /app
copy package.json bun.lock ./
RUN bun install
COPY . .
EXPOSE 3000
CMD ["bun", "run", "src/index.tsl"]
