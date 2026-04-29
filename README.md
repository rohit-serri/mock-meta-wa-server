# Mock Meta WhatsApp Business Platform Server (Bun + Elysia + Drizzle)

A high-performance local mock server that emulates the Meta Graph API for WhatsApp Business, designed specifically for testing Business Solution Provider (BSP) systems and local applications without requiring an active WhatsApp Business Account or incurring costs.

This version uses **Bun**, **Elysia.js**, and **PostgreSQL** to provide persistent mock data, automatic Swagger documentation, and lightning-fast responses.

## Prerequisites
- [Bun](https://bun.sh/) installed locally.
- [Docker & Docker Compose](https://docs.docker.com/compose/) for the PostgreSQL database.

## Getting Started

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start the database:**
   ```bash
   docker compose up -d
   ```

3. **Push the database schema:**
   ```bash
   bun run db:push
   ```

4. **Start the server (with hot reload):**
   ```bash
   bun run dev
   ```

## Usage

### Automatic Swagger UI
The server runs on port 3000 by default and automatically generates a comprehensive OpenAPI / Swagger interface.
- Open your browser to: **http://localhost:3000/swagger**

From the Swagger UI, you can inspect all the emulated routes (`/v20.0/...`) and the `Admin` routes.

### Setting up a Webhook
You can configure a webhook and trigger inbound messages via the `/admin` REST endpoints:

**Configure Webhook:**
```bash
curl -X POST http://localhost:3000/admin/configure_webhook \
-H "Content-Type: application/json" \
-d '{
  "target_id": "10000",
  "url": "http://your-local-webhook-url",
  "verify_token": "my-secret"
}'
```
*Note: The mock server will immediately emulate the Meta `GET` handshake to verify your endpoint.*

**Simulate an Inbound User Message:**
```bash
curl -X POST http://localhost:3000/admin/trigger_message \
-H "Content-Type: application/json" \
-d '{
  "phone_number_id": "100001",
  "from": "15550001111",
  "message_type": "text",
  "text_body": "Hello from mock user!"
}'
```

### Outbound Messaging API
The server automatically seeds a test WABA (`id: 10000`) and a Phone Number (`id: 100001`).

```bash
curl -X POST 'http://localhost:3000/v20.0/100001/messages' \
-H 'Authorization: Bearer <any_token>' \
-H 'Content-Type: application/json' \
-d '{
  "messaging_product": "whatsapp",
  "to": "15551234567",
  "type": "text",
  "text": { "body": "Hello from mock API!" }
}'
```
*(Check your configured webhook, as the server will dispatch async `sent`, `delivered`, and `read` statuses!)*