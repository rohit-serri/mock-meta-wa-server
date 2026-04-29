const axios = require('axios');
const crypto = require('crypto');
const store = require('./store');

class WebhookSender {
    async sendWebhook(targetId, payload) {
        const config = store.getWebhookConfig(targetId);
        if (!config || !config.url) {
            console.log(`[WebhookSender] No webhook URL configured for target ${targetId}. Skipping payload.`);
            return;
        }

        const data = JSON.stringify(payload);
        
        let headers = {
            'Content-Type': 'application/json',
        };

        if (config.verifyToken) {
            // Optional: Meta doesn't always sign with verifyToken, it signs with app secret. 
            // In a real mock, we'd sign with an APP_SECRET. Let's just use the verifyToken as a dummy secret.
            const hmac = crypto.createHmac('sha256', config.verifyToken);
            hmac.update(data);
            headers['X-Hub-Signature-256'] = `sha256=${hmac.digest('hex')}`;
        }

        try {
            console.log(`[WebhookSender] Dispatching webhook to ${config.url}`);
            const response = await axios.post(config.url, data, { headers, timeout: 5000 });
            console.log(`[WebhookSender] Webhook delivered. Status: ${response.status}`);
        } catch (error) {
            console.error(`[WebhookSender] Failed to deliver webhook: ${error.message}`);
        }
    }

    createMessageStatusPayload(phoneId, messageId, recipientId, status, timestamp) {
        return {
            object: "whatsapp_business_account",
            entry: [{
                id: store.getPhoneNumber(phoneId)?.waba_id || "unknown",
                changes: [{
                    value: {
                        messaging_product: "whatsapp",
                        metadata: {
                            display_phone_number: store.getPhoneNumber(phoneId)?.display_phone_number || "unknown",
                            phone_number_id: phoneId
                        },
                        statuses: [{
                            id: messageId,
                            status: status,
                            timestamp: timestamp || Math.floor(Date.now() / 1000),
                            recipient_id: recipientId,
                            pricing: {
                                billable: true,
                                pricing_model: "CBP",
                                category: "authentication"
                            }
                        }]
                    },
                    field: "messages"
                }]
            }]
        };
    }
}

module.exports = new WebhookSender();
