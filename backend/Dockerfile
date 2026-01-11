FROM golang:1.23-alpine

WORKDIR /app

# Set Go Proxy to speed up downloads and avoid some network issues
ENV GOPROXY=https://proxy.golang.org,direct

# Install Air and Swag
RUN go install github.com/cosmtrek/air@v1.49.0
RUN go install github.com/swaggo/swag/cmd/swag@latest

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Generate Swagger Docs (Optimized)
# Only scan specific directories to avoid scanning tmp or other large folders
RUN swag init -g main.go --output docs --exclude tmp,vendor

EXPOSE 8000

CMD ["air"]
