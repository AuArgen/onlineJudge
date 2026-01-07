# Use a base image with Go installed
FROM golang:1.21-bullseye

# Install necessary compilers and tools
RUN apt-get update && apt-get install -y \
    python3 \
    g++ \
    default-jdk \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Run go mod tidy AFTER copying source code to detect all imports
RUN go mod tidy

# Build the application
RUN go build -o online-judge .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["./online-judge"]
