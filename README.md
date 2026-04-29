# Mock Meta WhatsApp Business Platform Server

A comprehensive local mock server that emulates the Meta Graph API for WhatsApp Business, designed specifically for testing Business Solution Provider (BSP) systems and local applications without requiring an active WhatsApp Business Account or incurring costs.

## Features Mapped
Based on official Meta Documentation.

1. **Phase 1: Core Framework & Auth**
   - Versioned Graph API routing (`/v17.0/...`)
   - Bearer token authentication
   - Standard Graph API Error schema matching

2. **Phase 2: Webhooks Simulator**
   - Webhook Dashboard UI at `/admin/dashboard`
   - Emulates verification handshake (`hub.mode`, `hub.challenge`, `hub.verify_token`)
   - Simulate inbound user text & image messages
   - Dispatches automated `sent`, `delivered`, and `read` status receipts for outbound messages

3. **Phase 3: Outbound Messaging API (`/:phone_number_id/messages`)**
   - Validates `messaging_product`, `to`, `type`
   - Basic structural validation for `text`, `image`, `video`, `audio`, `document`, `sticker`, `interactive`, `location`, `contacts`, `template`, `reaction`
   - Returns valid `wamid` response structure

4. **Phase 4: Media API**
   - `POST /:phone_number_id/media` (multipart upload)
   - `GET /:media_id` (returns simulated download URL and metadata)
   - `GET /:media_id/download` (downloads uploaded binary)
   - `DELETE /:media_id`

5. **Phase 5: Template Management API**
   - `POST /:waba_id/message_templates` (Create)
   - `GET /:waba_id/message_templates` (List)
   - `POST /:waba_id/message_templates/:template_id` (Update)
   - `DELETE /:waba_id/message_templates` (Delete)

6. **Phase 6: Phone Number & Profile Management**
   - `GET /:waba_id/phone_numbers` (List connected numbers)
   - `GET|POST /:phone_number_id/whatsapp_business_profile` (Read/Update)
   - `POST /:phone_number_id/request_code`
   - `POST /:phone_number_id/verify_code`
   - `POST /:phone_number_id/register`
   - `POST /:phone_number_id/deregister`

7. **Phase 7: WhatsApp Flows**
   - `POST /:waba_id/flows`
   - `GET /:waba_id/flows`
   - `POST /:flow_id/assets`
   - `POST /:flow_id/publish`

8. **Phase 8: Analytics**
   - `GET /:waba_id/conversation_analytics` (Mocked dimensional data)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server (runs on port 3000 by default):
   ```bash
   npm run dev
   ```

3. Set an optional API Token (if left unset, any Bearer token works):
   Create a `.env` file and set `VALID_TOKEN=mysecrettoken`.

## Usage

### The Webhook Simulator (Admin UI)
Open your browser to: **http://localhost:3000/admin/dashboard**

From here you can:
- **Set Webhook**: Define the URL of your local app (e.g. `http://localhost:8080/webhook`) and an optional verify token. The mock server will emulate the Meta verification handshake.
- **Simulate Inbound Message**: Send a mock text or image message from a "user" to your application via the configured webhook.

### Testing the Graph API
The default seeded Phone Number ID is `100001` attached to WABA ID `10000`.

**Send a message:**
```bash
curl -X POST 'http://localhost:3000/v17.0/100001/messages' \
-H 'Authorization: Bearer mocktoken' \
-H 'Content-Type: application/json' \
-d '{
  "messaging_product": "whatsapp",
  "to": "15551234567",
  "type": "text",
  "text": { "body": "Hello from mock API!" }
}'
```

**Get Business Profile:**
```bash
curl -X GET 'http://localhost:3000/v17.0/100001/whatsapp_business_profile' \
-H 'Authorization: Bearer mocktoken'
```