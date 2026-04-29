# Media API

## Endpoint: `POST /:version/:phone_number_id/media`
Upload media to the WhatsApp servers. Returns an ID for sending media messages.

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

### Request Body (Form-Data)
- `messaging_product` (string) - **Required**. Must be `"whatsapp"`.
- `file` (file) - **Required**. The file to upload.
- `type` (string) - Optional. The media type (e.g., `image/jpeg`).

### Success Response (200 OK)
```json
{
  "id": "<generated_media_id>"
}
```

### Error Scenarios
- If `messaging_product` is missing or not `"whatsapp"`.
- If `file` is missing.

### Mock Behaviors
- **Validation**: Check `messaging_product` and `file`.
- **Database**: Generate a new media ID, get the file's mime type, hash the file (SHA256), and get its size. Save the file to `./uploads/<media_id>` and insert a record into the `media` table.
- **Response**: Return the `id`.

---

## Endpoint: `GET /:version/:media_id`
Retrieve information about a specific media item.

### Request Headers
- `Authorization: Bearer <token>`

### Success Response (200 OK)
```json
{
  "url": "http://localhost:3000/:version/:media_id/download",
  "mime_type": "image/jpeg",
  "sha256": "hash_value",
  "file_size": 12345,
  "id": "<media_id>",
  "messaging_product": "whatsapp"
}
```

### Mock Behaviors
- **Validation**: Check if `media_id` exists in the database.
- **Response**: Return the metadata. The `url` field should point to the mock download endpoint.

---

## Endpoint: `GET /:version/:media_id/download`
Download the actual binary content of a specific media item. (This is a mock-specific behavior to easily retrieve files locally).

### Request Headers
- `Authorization: Bearer <token>` (Optional)

### Success Response (200 OK)
Returns the binary file content with the correct `Content-Type` header (e.g., `image/jpeg`).

### Error Scenarios
- If `media_id` does not exist, return standard Graph API error (404).

### Mock Behaviors
- **Validation**: Check if `media_id` exists in the database.
- **Response**: Stream or send the file from `./uploads/<media_id>`.

---

## Endpoint: `DELETE /:version/:media_id`
Delete a specific media item from the WhatsApp servers.

### Request Headers
- `Authorization: Bearer <token>`

### Success Response (200 OK)
```json
{
  "success": true
}
```

### Mock Behaviors
- **Validation**: Check if `media_id` exists.
- **Database**: Delete the record from the `media` table and delete the physical file from `./uploads/`.
- **Response**: Return `{"success": true}`.
