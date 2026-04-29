# Mocking the Embedded Signup Flow

The Embedded Signup flow is how Business Solution Providers (BSPs) onboard client businesses onto the WhatsApp Business Platform. In the real Meta ecosystem, this involves a complex OAuth popup window where the business owner logs into Facebook, creates a WhatsApp Business Account (WABA), selects or creates a phone number, and grants permissions to the BSP's app.

In this mock server environment, we don't have a Facebook frontend popup. Instead, we simulate the *backend* API calls that a BSP's system must make *after* the popup closes to finalize the onboarding process.

## The Mock Flow

Here is how you can use the mock server to simulate the backend steps of onboarding a new client phone number.

### 1. (Prerequisite) The "Popup" Finishes
In production, when the Facebook popup closes, your frontend receives an OAuth `code` which you exchange for a user access token, and the popup passes you a `waba_id` and a `phone_number_id`. 

For the mock, you will just use our seeded database values:
- `WABA_ID` = `10000`
- `PHONE_NUMBER_ID` = `100001`
- `BUSINESS_ID` = `99999` (You can use any ID for the mock Business)

### 2. Verify the WABA Ownership
Your system should verify that the WABA belongs to the business and fetch its details (currency, timezone, namespace).

```bash
curl -X GET "http://localhost:3000/v20.0/10000/client_whatsapp_business_accounts" \
  -H "Authorization: Bearer mocktoken"
```

### 3. Check Subscribed Apps (Webhooks)
Ensure your Application is actually subscribed to receive webhooks for this WABA.

```bash
curl -X GET "http://localhost:3000/v20.0/10000/subscribed_apps" \
  -H "Authorization: Bearer mocktoken"
```
*(If this is empty, you can use the `/admin/configure_webhook` UI to attach your app's webhook URL to this WABA).*

### 4. Fetch the Phone Number Details
After the user selects a phone number in the popup, you need to pull the metadata (like the display number and Quality Rating) into your system.

```bash
curl -X GET "http://localhost:3000/v20.0/10000/phone_numbers" \
  -H "Authorization: Bearer mocktoken"
```

### 5. Check if the Number is Pre-verified
Often, numbers selected via Embedded Signup bypass OTP. You can check if the number is already verified.

```bash
curl -X GET "http://localhost:3000/v20.0/10000/preverified_numbers?code_verification_status=VERIFIED" \
  -H "Authorization: Bearer mocktoken"
```

### 6. Register the Phone Number
Even if the number is pre-verified by Meta during the popup flow, **your BSP backend must still explicitly call the `/register` endpoint** to attach a 6-digit PIN and activate the number for messaging.

```bash
curl -X POST "http://localhost:3000/v20.0/100001/register" \
  -H "Authorization: Bearer mocktoken" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "pin": "123456"
  }'
```

### 7. Send a Test Message!
Once the number is registered, the onboarding flow is complete. You can immediately send a test message.

```bash
curl -X POST "http://localhost:3000/v20.0/100001/messages" \
  -H "Authorization: Bearer mocktoken" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "15550001111",
    "type": "text",
    "text": { "body": "Hello world from the embedded signup mock!" }
  }'
```