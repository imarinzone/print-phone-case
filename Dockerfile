# Stage 1: Build the application
FROM golang:1.19-alpine AS builder

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/. .

RUN CGO_ENABLED=0 GOOS=linux go build -o /main .

# Stage 2: Create the final, small image
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]