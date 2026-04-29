# Embedded Signup & Onboarding API

## Endpoint: `GET /:version/:business_id/client_whatsapp_business_accounts`
Retrieves a list of client WhatsApp Business Accounts shared with the specified business.

### Request Headers
- `Authorization: Bearer <token>`

### Success Response (200 OK)
```json
{
  "data": [
    {
      "id": "waba_id",
      "name": "Business Name",
      "currency": "USD",
      "timezone_id": "UTC",
      "message_template_namespace": "mock_namespace_waba_id"
    }
  ]
}
```

### Mock Behaviors
- Returns all WABAs currently in the database to simulate shared WABAs.

---

## Endpoint: `GET /:version/:business_id/whatsapp_business_accounts`
Retrieves a list of WhatsApp Business Accounts associated with a given business.

### Request Headers
- `Authorization: Bearer <token>`

### Success Response (200 OK)
Returns exactly the same structure as `client_whatsapp_business_accounts`.

---

## Endpoint: `GET /:version/:waba_id`
Retrieve comprehensive details about a WhatsApp Business Account.

### Request Headers
- `Authorization: Bearer <token>`

### Success Response (200 OK)
```json
{
  "id": "10000",
  "name": "Test WABA",
  "currency": "USD",
  "timezone_id": "UTC",
  "message_template_namespace": "mock_namespace_10000",
  "status": "APPROVED"
}
```

### Error Scenarios
- If `waba_id` does not exist in the database, returns 404 Graph Error.

---

## Endpoint: `GET /:version/:waba_id/subscribed_apps`
Retrieves a list of all applications subscribed to receive webhook notifications for a specific WhatsApp Business Account (WABA).

### Request Headers
- `Authorization: Bearer <token>`

### Success Response (200 OK)
```json
{
  "data": [
    {
      "whatsapp_business_api_data": {
        "link": "http://your-configured-webhook.com",
        "name": "Mock Application"
      }
    }
  ]
}
```

### Mock Behaviors
- Queries the `webhook_configs` table. If a URL is configured for the `waba_id`, returns it. Otherwise returns an empty data array.

---

## Endpoint: `POST /:version/:application_id/whatsapp_business_solution`
Create a new Multi-Partner Solution that defines permission distribution between a solution owner app and a partner app for WhatsApp Business messaging collaboration.

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### Request Body (JSON)
- `owner_permissions` (array of strings) - Required.
- `partner_app_id` (string) - Required.
- `partner_permissions` (array of strings) - Required.
- `solution_name` (string) - Required.

### Success Response (200 OK)
```json
{
  "success": true,
  "id": "solution_123456789"
}
```

### Error Scenarios
- If any required fields are missing, returns 400 Graph API Error.

---

## Endpoint: `GET /:version/:business_account_id/preverified_numbers`
Retrieve all WhatsApp Business Pre-Verified Phone Number objects.

### Request Headers
- `Authorization: Bearer <token>`

### Query Parameters
- `code_verification_status` (string) - Optional. e.g., `VERIFIED`.

### Success Response (200 OK)
```json
{
  "data": [
    {
      "id": "phone_id",
      "phone_number": "15551234567",
      "display_phone_number": "1 555 123 4567",
      "code_verification_status": "VERIFIED",
      "quality_rating": "GREEN"
    }
  ]
}
```

### Mock Behaviors
- Filters phone numbers by `waba_id` (business_account_id).
- Returns numbers, mapping `status` from `CONNECTED`/`VERIFIED` to the requested schema.
