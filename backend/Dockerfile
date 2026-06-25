# STAGE 1: Build
# We use the official Go image to compile our app. 
# Think of this as a temporary workshop where we build the engine.
FROM golang:1.24-bookworm AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the dependency files first. 
COPY go.mod go.sum ./
RUN go mod download

# Copy the Prisma schema and generate the client.
# This ensures the correct "Query Engine" binary for Linux is downloaded.
COPY schema.prisma ./
RUN go run github.com/steebchen/prisma-client-go generate

# Copy the rest of the source code
COPY . .

# Compile the Go app into a single binary named "server"
RUN go build -o server main.go

# STAGE 2: Run
# We switch to a minimal Debian image for the final container.
FROM debian:bookworm-slim

# Install necessary libraries for Prisma and SSL
# - ca-certificates: needed for talking to Supabase (HTTPS)
# - openssl: needed by the Prisma Query Engine
RUN apt-get update && apt-get install -y \
    ca-certificates \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy ONLY the binary and the Prisma engine from the builder stage
COPY --from=builder /app/server .
COPY --from=builder /app/db ./db

# Expose the port your Gin server runs on
EXPOSE 8080

# Command to run the application
CMD ["./server"]
