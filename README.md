# Mock Meta WhatsApp Business Platform Server (Bun + Elysia + Drizzle)

A high-performance local mock server that emulates the Meta Graph API for WhatsApp Business, designed specifically for testing Business Solution Provider (BSP) systems and local applications without requiring an active WhatsApp Business Account or incurring costs.

This version uses **Bun**, **Elysia.js**, and **PostgreSQL** to provide persistent mock data, automatic Swagger documentation, and lightning-fast responses.

# WhatsApp Business Platform REST API Endpoints

This table extracts all documented REST API endpoints for the WhatsApp Business Platform, categorized by feature.

## Analytics

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /<WABA_ID>/call_analytics` | Retrieves the number of user-initiated calls received by all phone numbers associated with your WABA in a specified granularity. | ❌ Not Implemented |
| `GET /<WHATSAPP_BUSINESS_ACCOUNT_ID>/group_analytics` | Get the number of messages sent, delivered, and read in WhatsApp groups, as well as the number of participants who joined or left. | ❌ Not Implemented |

## Application

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `POST /whatsapp_business_solution` | Create a new Multi-Partner Solution that defines permission distribution between a solution owner app and a partner app for WhatsApp Business messaging collaboration. | ❌ Not Implemented |
| `POST /{Version}/{Application-ID}/whatsapp_business_solution` | Create a new Multi-Partner Solution that defines permission distribution between a solution owner app and a partner app for WhatsApp Business messaging collaboration. | ❌ Not Implemented |

## Block Users

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /v1/accounts/{accountId}/whatsapp/blocked_users` | Retrieves a list of all WhatsApp users currently blocked from messaging your business. | ❌ Not Implemented |

## Business

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /client_whatsapp_business_accounts` | Retrieves a list of client WhatsApp Business Accounts that have been shared with the specified business. | ❌ Not Implemented |
| `POST /onboard_partners_to_mm_lite` | Initiates the onboarding process for a partner to the WhatsApp Business Messaging Lite platform. | ❌ Not Implemented |
| `GET /v23.0/{Business-ID}/whatsapp_business_accounts` | Retrieves a list of WhatsApp Business Accounts (WABA) associated with the specified business ID. | ❌ Not Implemented |
| `GET /websites/developers.facebook.com/business_messaging/whatsapp` | Retrieves the status and details of a WhatsApp Business Account. | ❌ Not Implemented |
| `GET /{Version}/{Business-ID}/client_whatsapp_business_accounts` | Retrieves a list of client WhatsApp Business Accounts that have been shared with the specified business. | ❌ Not Implemented |
| `POST /{Version}/{Business-ID}/onboard_partners_to_mm_lite` | Initiates the onboarding process for an end business to the MM Lite platform. | ❌ Not Implemented |
| `GET /{Version}/{Business-ID}/whatsapp_business_accounts` | Retrieves a list of WhatsApp Business Accounts (WABA) associated with the specified business ID. | ❌ Not Implemented |

## Business Phone Numbers

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /<API_VERSION>/<MEDIA_ID>` | Use the Media API to get a media URL by querying the media ID directly. | ✅ Implemented |
| `POST /<PHONE_NUMBER_ID>/conversational_automation?prompts=<PROMPT>` | This POST request syntax is used to configure prompts for your WhatsApp business number. | ❌ Not Implemented |
| `GET /<PHONE_NUMBER_ID>?fields=conversational_automation` | This GET request retrieves the current conversational automation configuration, including prompts and commands, for a specific phone number ID from the WhatsApp Business API. | ❌ Not Implemented |
| `GET /<WHATSAPP_BUSINESS_PHONE_NUMBER_ID>?fields=throughput` | Use this endpoint to get a phone number's current throughput level. | ❌ Not Implemented |
| `GET /PHONE_NUMBER_ID?fields=conversational_automation` | Retrieves the current configuration of Conversational Components for a specific phone number. | ❌ Not Implemented |

## Business Scoped User Ids

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /<API_VERSION>/<BUSINESS_PHONE_NUMBER_ID>/block_users` | Retrieves a list of users who have been blocked for a WhatsApp Business phone number. | ❌ Not Implemented |
| `GET /<BUSINESS_PHONE_NUMBER_ID>/username` | Get the status of the business username associated with the business phone number, or information about the username. | ❌ Not Implemented |
| `GET /<GROUP_ID>` | These changes apply to GET /<GROUP_ID> endpoint responses, providing updated participant information within groups. | ❌ Not Implemented |
| `GET /<GROUP_ID>/join_requests` | This JSON structure represents the response from the GET /<GROUP_ID>/join_requests endpoint, detailing user information for join requests. | ❌ Not Implemented |

## Calling

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /<PHONE_NUMBER_ID>/call_permissions` | Get the call permission state for a business phone number with a single WhatsApp user phone number. | ❌ Not Implemented |
| `GET /<PHONE_NUMBER_ID>/call_permissions?user_wa_id=<CONSUMER_WHATSAPP_ID>` | This is the syntax for the GET request to retrieve the call permission state for a business phone number and a specific WhatsApp user. | ❌ Not Implemented |
| `GET /<PHONE_NUMBER_ID>/settings` | A sample success response body for the GET /<PHONE_NUMBER_ID>/settings endpoint, showing enabled calling features, call hours, SIP configuration, and audio codecs. | ❌ Not Implemented |
| `POST /calls` | Use this endpoint to initiate, accept, reject, or terminate WhatsApp calls. | ❌ Not Implemented |
| `POST /initiate_call` | Initiates a new call to a WhatsApp user. | ❌ Not Implemented |
| `GET /websites/developers.facebook.com/business-messaging/whatsapp/calling` | This endpoint allows you to check the current call permissions and available actions for a specific business phone number against a consumer's WhatsApp ID. | ❌ Not Implemented |

## Catalogs

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /<BUSINESS_PHONE_NUMBER_ID>/whatsapp_commerce_settings` | Get an individual business phone number’s commerce settings. | ❌ Not Implemented |
| `POST /messages` | Send a message using the WhatsApp Business API. | ✅ Implemented |

## Ctwa

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /<WHATSAPP_BUSINESS_ACCOUNT_ID>/welcome_message_sequences` | Use this GET request to retrieve a list of all welcome message sequences or details for a specific sequence. | ❌ Not Implemented |
| `POST /<WHATSAPP_BUSINESS_ACCOUNT_ID>/welcome_message_sequences` | Use this POST request to create a new welcome message sequence or modify an existing one. | ❌ Not Implemented |

## Embedded Signup

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /102290129340398/phone_numbers?display_phone_number=16505551234` | Use the GET /<WABA_ID>/phone_numbers endpoint with the display_phone_number parameter to filter results. | ✅ Implemented |
| `GET /<BUSINESS_ACCOUNT_ID>/preverified_numbers` | Use the GET /<BUSINESS_ACCOUNT_ID>/preverified_numbers endpoint with the code_verification_status=VERIFIED parameter to filter for only verified numbers. | ❌ Not Implemented |
| `GET /<BUSINESS_ACCOUNT_ID>/preverified_numbers?code_verification_status=VERIFIED` | Use the GET /<BUSINESS_ACCOUNT_ID>/preverified_numbers endpoint with the code_verification_status=VERIFIED parameter to filter for only verified numbers. | ❌ Not Implemented |
| `GET /<WABA_ID>/phone_numbers` | Use the GET /<WABA_ID>/phone_numbers endpoint with the display_phone_number parameter to filter results. | ✅ Implemented |

## Groups

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /<BUSINESS_PHONE_NUMBER_ID>/groups` | Retrieves a list of active groups associated with a business phone number. | ❌ Not Implemented |
| `GET /<GROUP_ID>/invite_link` | Retrieves the current invite link for a specified WhatsApp group. | ❌ Not Implemented |
| `GET /<GROUP_ID>?fields=<FIELDS>` | Retrieve metadata about a group using this GET request. | ❌ Not Implemented |
| `GET /<WABA_ID>` | This is a GET request example for retrieving pricing analytics for the Groups API. | ❌ Not Implemented |
| `GET /v23.0/{group_id}` | Retrieve metadata about a single group. | ❌ Not Implemented |
| `GET /{Version}/{group_id}` | Retrieve metadata about a single group. | ❌ Not Implemented |
| `GET /{Version}/{group_id}/join_requests` | Get a list of open join requests for a group | ❌ Not Implemented |

## Local Storage

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /<WHATSAPP_BUSINESS_PHONE_NUMBER_ID>/settings` | Retrieves the local storage settings configured for a WhatsApp Business Phone Number. | ❌ Not Implemented |

## Marketing Messages

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /<BUSINESS_PORTFOLIO_ID>/` | Checks the Terms of Service (ToS) and intent request status for a business manager regarding marketing messages for WhatsApp. | ❌ Not Implemented |
| `GET /<TEMPLATE_ID>` | Retrieves the automatic creative optimizations statuses for a specific message template. | ❌ Not Implemented |
| `GET /<TEMPLATE_ID>/?fields=bid_spec` | This is an example of the JSON response when retrieving max-price information for a specific WhatsApp message template using the GET /<TEMPLATE_ID>/?fields=bid_spec endpoint. | ❌ Not Implemented |
| `POST /<WHATSAPP_BUSINESS_ACCOUNT_ID>` | Use this endpoint to opt-in or out of various creative optimization features at the WhatsApp Business Account level. | ❌ Not Implemented |
| `GET /<WHATSAPP_BUSINESS_ACCOUNT_ID>` | Retrieves the onboarding status of a WABA by fetching the `owner_business_info` field. | ❌ Not Implemented |
| `POST /<WHATSAPP_BUSINESS_ACCOUNT_ID>/message_templates` | Creates a WhatsApp message template and optionally sets a maximum price for message deliveries using the `bid_spec` object. | ✅ Implemented |
| `GET /insights` | Retrieves benchmark metrics for marketing messages, specifically read rates and click rates, allowing comparison against industry standards. | ❌ Not Implemented |
| `GET /{TEMPLATE_ID}?fields=degrees_of_freedom_spec` | Use the GET /<TEMPLATE_ID> endpoint to retrieve the current statuses of automatic creative optimizations for a specific message template. | ❌ Not Implemented |

## Media

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /v23.0/{Media-URL}` | Download media files using URLs obtained from media retrieval endpoints. | ✅ Implemented |
| `GET /{Version}/{Media-URL}` | Download media files using URLs obtained from media retrieval endpoints. | ✅ Implemented |

## Messages

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `POST /v25.0/{Phone-Number-ID}/messages` | Sends a location request message to a WhatsApp user, prompting them to share their location. | ✅ Implemented |

## Official Business Accounts

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /<WHATSAPP_BUSINESS_PHONE_NUMBER_ID>` | Requests the `official_business_account` field on your business phone number to get the status of an OBA request. | ❌ Not Implemented |

## Payments

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `POST /<WHATSAPP_BUSINESS_ACCOUNT_ID>/payment_configuration` | Creates a new payment configuration for a WhatsApp Business Account. | ❌ Not Implemented |
| `POST /<WHATSAPP_BUSINESS_ACCOUNT_ID>/payment_configuration/<CONFIGURATION_NAME>` | Link or update a data endpoint to enable coupons, shipping address, and real-time inventory offered by Checkout Button Templates. | ❌ Not Implemented |
| `GET /<WHATSAPP_BUSINESS_ACCOUNT_ID>/payment_configuration/<CONFIGURATION_NAME>` | Retrieves a specific payment configuration linked to a WhatsApp Business Account. | ❌ Not Implemented |
| `GET /<WHATSAPP_BUSINESS_ACCOUNT_ID>/payment_configurations` | Get a list of payment configurations linked to the WhatsApp Business Account. | ❌ Not Implemented |
| `GET /payments/{payment_configuration}/{reference_id}` | Retrieves the status of a payment for a given order. | ❌ Not Implemented |

## Pricing

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /<WABA_ID>?fields=auth_international_rate_eligibility` | Retrieves the start time and exception countries for authentication-international rates for a given WhatsApp Business Account (WABA). | ❌ Not Implemented |

## Qr Codes

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /message_qrdls/{qr_code_id}` | Retrieves information about a specific QR code. | ❌ Not Implemented |

## Solution Providers

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /<WABA_ID>/subscribed_apps` | Retrieves a list of all applications subscribed to receive webhook notifications for a specific WhatsApp Business Account (WABA). | ❌ Not Implemented |

## Whatsapp Account Number

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /v{Version}/{WhatsApp-Account-Number-ID}` | Retrieves information about a specific WhatsApp Business Account. | ❌ Not Implemented |

## Whatsapp Business Account

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /assigned_users` | Retrieves a list of users assigned to the WhatsApp Business Account. | ❌ Not Implemented |
| `GET /message_templates` | Retrieves a list of message templates associated with a WhatsApp Business Account (WABA). | ✅ Implemented |
| `GET /schedules` | Retrieves all schedules associated with a WhatsApp Business Account, including their configuration, status, and execution details. | ❌ Not Implemented |
| `GET /subscribed_apps` | Retrieves a list of all applications currently subscribed to webhook events for the specified WhatsApp Business Account. | ❌ Not Implemented |
| `GET /v1/{WABA-ID}` | Retrieve comprehensive details about a WhatsApp Business Account, including its configuration, status, and settings. | ❌ Not Implemented |
| `GET /websites/developers_facebook_business-messaging_whatsapp/{whatsapp_business_account_id}/schedules/{schedule_id}` | Retrieves the details of a specific WhatsApp Business Account schedule. | ❌ Not Implemented |
| `GET /{Version}/{WABA-ID}` | Retrieve comprehensive details about a WhatsApp Business Account, including its configuration, status, and settings. | ❌ Not Implemented |
| `GET /{Version}/{WABA-ID}/message_templates` | Retrieves a list of message templates associated with a WhatsApp Business Account (WABA). | ✅ Implemented |
| `GET /{Version}/{WABA-ID}/schedules` | Retrieves all schedules associated with a WhatsApp Business Account, including their configuration, status, and execution details. | ❌ Not Implemented |
| `GET /{Version}/{WABA-ID}/subscribed_apps` | Retrieves a list of all applications currently subscribed to webhook events for the specified WhatsApp Business Account. | ❌ Not Implemented |
| `GET /{Version}/{WhatsApp-Business-Account-ID}/assigned_users` | Retrieves a list of users assigned to the WhatsApp Business Account. | ❌ Not Implemented |

## Whatsapp Business Phone Number

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /call_permissions` | Check whether you have permission to call a WhatsApp user and what actions are available. | ❌ Not Implemented |
| `GET /settings` | Retrieves the current settings for a WhatsApp Business phone number, including calling, payload encryption, and storage configurations. | ❌ Not Implemented |
| `GET /whatsapp_business_profile` | Retrieves comprehensive information about a WhatsApp Business Profile, including business details, contact information, and profile settings. | ✅ Implemented |
| `GET /whatsapp_commerce_settings` | Retrieves the current WhatsApp commerce settings, including whether the cart and catalog are enabled and visible. | ❌ Not Implemented |
| `GET /{Version}/{Phone-Number-ID}/call_permissions` | Check whether you have permission to call a WhatsApp user and what actions are available. | ❌ Not Implemented |
| `POST /{Version}/{Phone-Number-ID}/calls` | Use this endpoint to initiate, accept, reject, or terminate WhatsApp calls. | ❌ Not Implemented |
| `POST /{Version}/{Phone-Number-ID}/groups` | Create a new group and get an invite link. | ❌ Not Implemented |
| `GET /{Version}/{Phone-Number-ID}/settings` | Retrieves the current settings for a WhatsApp Business phone number, including calling, payload encryption, and storage configurations. | ❌ Not Implemented |
| `GET /{Version}/{Phone-Number-ID}/whatsapp_business_profile` | Retrieves comprehensive information about a WhatsApp Business Profile, including business details, contact information, and profile settings. | ✅ Implemented |
| `GET /{Version}/{Phone-Number-ID}/whatsapp_commerce_settings` | Retrieves the commerce settings for a specific WhatsApp Business phone number, including catalog visibility and shopping cart enablement. | ❌ Not Implemented |

## Whatsapp Business Solution

| HTTP Method & Path | Description | Implementation Status |
| --- | --- | --- |
| `GET /access_token` | Retrieves an active granular Business Integration Server User (BISU) access token. | ❌ Not Implemented |



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