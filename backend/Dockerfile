# Build Stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies (if needed)
# Added update to refresh repositories
RUN apk update && apk add --no-cache git

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
# CGO_ENABLED=0 creates a statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Run Stage
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies (e.g., for health checks or debugging)
# Added update here too
RUN apk update && apk add --no-cache ca-certificates

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Expose port
EXPOSE 8000

# Command to run
CMD ["./main"]
