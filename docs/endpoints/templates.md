# Templates API

## Endpoint: `POST /:version/:waba_id/message_templates`

Create a message template for a WhatsApp Business Account.

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### Request Body (JSON)
- `name` (string) - **Required**. Alphanumeric and underscores only.
- `language` (string) - **Required**. The BCP 47 language tag (e.g., `en_US`).
- `category` (string) - **Required**. The template category (e.g., `MARKETING`, `UTILITY`, `AUTHENTICATION`).
- `components` (array) - **Required**. An array of objects representing the template structure (e.g., `type: "HEADER"`, `type: "BODY"`).
- `bid_spec` (object) - Optional. Specifies maximum price (`bid_amount`).

### Success Response (200 OK)
```json
{
  "id": "<generated_template_id>",
  "status": "APPROVED",
  "category": "MARKETING"
}
```

### Error Scenarios
- Missing required fields `name`, `language`, `category`, `components`. Returns Graph API 400 Error.

### Mock Behaviors
- Validate required fields.
- Insert a new template record with `wabaId = waba_id`, `bidSpec = bid_spec`, and set status to `"APPROVED"`.

---

## Endpoint: `GET /:version/:waba_id/message_templates`

List all message templates for a WhatsApp Business Account.

### Request Headers
- `Authorization: Bearer <token>`

### Query Parameters
- `name` (string) - Optional. Filter templates by name.

### Success Response (200 OK)
```json
{
  "data": [
    {
      "id": "template_id",
      "name": "hello_world",
      "language": "en_US",
      "status": "APPROVED",
      "category": "MARKETING",
      "components": [...]
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

### Mock Behaviors
- Query the database for templates belonging to `waba_id`. If `name` query param is provided, filter by `name`.

---

## Endpoint: `POST /:version/:waba_id/message_templates/:template_id`

Edit an existing message template.

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### Request Body (JSON)
- `components` (array) - **Required**. An array of updated components.
- `category` (string) - Optional. The new category.

### Success Response (200 OK)
```json
{
  "id": "<template_id>",
  "status": "APPROVED",
  "category": "MARKETING"
}
```

### Error Scenarios
- If `template_id` doesn't exist for the given `waba_id`, return 404.
- If `components` is missing, return 400.

### Mock Behaviors
- Update the components (and category if provided) for the existing template.

---

## Endpoint: `DELETE /:version/:waba_id/message_templates`

Delete a message template by name.

### Request Headers
- `Authorization: Bearer <token>`

### Query Parameters
- `name` (string) - **Required**. The name of the template to delete.

### Success Response (200 OK)
```json
{
  "success": true
}
```

### Error Scenarios
- If `name` is missing, return 400.

### Mock Behaviors
- Delete all templates with the given `name` and `waba_id`.
