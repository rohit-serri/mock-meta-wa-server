# Business API

## Endpoint: `GET /:version/:waba_id/phone_numbers`

List all phone numbers connected to a WhatsApp Business Account.

### Request Headers
- `Authorization: Bearer <token>`

### Success Response (200 OK)
```json
{
  "data": [
    {
      "id": "100001",
      "display_phone_number": "1 555 123 4567",
      "verified_name": "Test Business",
      "quality_rating": "GREEN",
      "status": "CONNECTED"
    }
  ],
  "paging": {
    "cursors": {
      "before": "",
      "after": ""
    }
  }
}
```

### Error Scenarios
- None (returns empty data array if no numbers).

### Mock Behaviors
- Query the database for `phone_numbers` with `wabaId`.

---

## Endpoint: `GET /:version/:phone_number_id/whatsapp_business_profile`

Retrieve a phone number's WhatsApp Business Profile.

### Request Headers
- `Authorization: Bearer <token>`

### Query Parameters
- `fields` (string) - Comma-separated list of fields (e.g., `about,address,description,email,profile_picture_url,websites,vertical`).

### Success Response (200 OK)
```json
{
  "data": [
    {
      "about": "Hello world",
      "address": "123 Test St",
      "description": "A test business",
      "email": "test@test.com",
      "profile_picture_url": "http://...",
      "websites": ["http://test.com"],
      "vertical": "RETAIL"
    }
  ]
}
```

### Error Scenarios
- If `phone_number_id` doesn't exist, return 400.

### Mock Behaviors
- Query the database for `phone_numbers`.
- Map the requested fields from the `profile` JSON column.

---

## Endpoint: `POST /:version/:phone_number_id/whatsapp_business_profile`

Update a phone number's WhatsApp Business Profile.

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### Request Body (JSON)
- `messaging_product` (string) - **Required**. Must be `"whatsapp"`.
- `about`, `address`, `description`, `email`, `profile_picture_url`, `websites`, `vertical` (string/array) - Optional. The fields to update.

### Success Response (200 OK)
```json
{
  "success": true
}
```

### Error Scenarios
- If `messaging_product` is not `"whatsapp"`, return 400.

### Mock Behaviors
- Update the `profile` column in the database with the new fields (merging with existing).

---

## Endpoint: `POST /:version/:phone_number_id/request_code`

Request an OTP code for phone number registration.

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### Request Body (JSON)
- `code_method` (string) - **Required**. `SMS` or `VOICE`.
- `language` (string) - Optional.

### Success Response (200 OK)
```json
{
  "success": true
}
```

### Mock Behaviors
- Validate `code_method`.

---

## Endpoint: `POST /:version/:phone_number_id/verify_code`

Verify the requested OTP code.

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### Request Body (JSON)
- `code` (string) - **Required**. The 6-digit OTP code.

### Success Response (200 OK)
```json
{
  "success": true
}
```

### Mock Behaviors
- Update the `phone_number` status to `"VERIFIED"`.

---

## Endpoint: `POST /:version/:phone_number_id/register`

Register a verified phone number to send and receive messages.

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### Request Body (JSON)
- `messaging_product` (string) - **Required**. Must be `"whatsapp"`.
- `pin` (string) - **Required**. A 6-digit PIN for two-step verification.

### Success Response (200 OK)
```json
{
  "success": true
}
```

### Mock Behaviors
- Validate `messaging_product` and `pin`. Update `phone_number` status to `"CONNECTED"`.

---

## Endpoint: `POST /:version/:phone_number_id/deregister`

Deregister a phone number.

### Request Headers
- `Authorization: Bearer <token>`

### Success Response (200 OK)
```json
{
  "success": true
}
```

### Mock Behaviors
- Update `phone_number` status to `"DEREGISTERED"`.
