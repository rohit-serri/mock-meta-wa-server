# Messages API

## Endpoint: `POST /:version/:phone_number_id/messages`

Sends outbound messages to users. This is the primary endpoint for sending WhatsApp messages.

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### Request Body (JSON)
- `messaging_product` (string) - **Required**. Must be `"whatsapp"`.
- `to` (string) - **Required**. The recipient's WhatsApp phone number.
- `type` (string) - Optional. Default is `"text"`. Values: `text`, `image`, `audio`, `video`, `document`, `sticker`, `interactive`, `template`, `location`, `contacts`, `reaction`.
- `recipient_type` (string) - Optional. `"individual"`.
- `text` (object) - Required if `type` is `text`. Contains `{ "body": "string", "preview_url": boolean }`.
- `audio`, `image`, `video`, `document`, `sticker` (object) - Required for media messages. Contains `{ "id": "string" }` or `{ "link": "string" }`. For audio, can include `"voice": true`.
- `template` (object) - Required if `type` is `template`. Contains `{ "name": "string", "language": { "code": "string" }, "components": [...] }`.
- `interactive` (object) - Required if `type` is `interactive`. Contains `{ "type": "string", "action": {...}, "body": {...} }`.
- `location` (object) - Required if `type` is `location`. Contains `{ "latitude": "string", "longitude": "string", "name": "string", "address": "string" }`.
- `contacts` (array) - Required if `type` is `contacts`.
- `reaction` (object) - Required if `type` is `reaction`. Contains `{ "message_id": "string", "emoji": "string" }`.

### Success Response (200 OK)
```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "<to_number>",
      "wa_id": "<to_number>"
    }
  ],
  "messages": [
    {
      "id": "wamid.<generated_id>"
    }
  ]
}
```

### Error Scenarios
If any required field is missing, return a Graph API error:
```json
{
  "error": {
    "message": "Specific error message here",
    "type": "OAuthException",
    "code": 100,
    "error_subcode": null,
    "fbtrace_id": "<generated_uuid>"
  }
}
```

### Mock Behaviors
1. **Validation**: Validate `messaging_product === "whatsapp"`, `to` is present, and the specific object for the `type` is provided (e.g., if `type="text"`, ensure `text.body` exists). Validate that `phone_number_id` exists in the database.
2. **Response**: Generate a `wamid` formatted ID and return the 200 response immediately.
3. **Webhooks Simulation**: Immediately after responding, trigger async delays (500ms, 1500ms, 3000ms) to send the `sent`, `delivered`, and `read` webhooks respectively using `webhookSender`.
