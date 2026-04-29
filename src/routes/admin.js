const express = require('express');
const store = require('../services/store');
const webhookSender = require('../services/webhookSender');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.post('/configure_webhook', async (req, res) => {
    const { target_id, url, verify_token } = req.body;
    if (!target_id || !url) return res.status(400).json({ error: 'Missing target_id or url' });
    
    if (verify_token) {
        // Emulate Webhook Verification Handshake
        const challenge = uuidv4().replace(/-/g, '');
        try {
            const verifyUrl = new URL(url);
            verifyUrl.searchParams.append('hub.mode', 'subscribe');
            verifyUrl.searchParams.append('hub.challenge', challenge);
            verifyUrl.searchParams.append('hub.verify_token', verify_token);
            
            const axios = require('axios');
            const verifyRes = await axios.get(verifyUrl.toString(), { timeout: 5000 });
            
            if (verifyRes.data.toString().trim() !== challenge) {
                return res.status(400).json({ error: `Webhook verification failed. Expected challenge '${challenge}', got '${verifyRes.data}'` });
            }
        } catch (error) {
            return res.status(400).json({ error: `Webhook verification request failed: ${error.message}` });
        }
    }
    
    store.setWebhookConfig(target_id, url, verify_token);
    res.json({ success: true, message: `Webhook configured for target ${target_id} and verified successfully.` });
});

router.post('/trigger_message', async (req, res) => {
    const { phone_number_id, from, message_type, text_body } = req.body;
    
    const phone = store.getPhoneNumber(phone_number_id);
    if (!phone) return res.status(400).json({ error: 'Invalid phone_number_id' });
    
    const config = store.getWebhookConfig(phone.waba_id) || store.getWebhookConfig(phone_number_id);
    if (!config || !config.url) {
        return res.status(400).json({ error: 'No webhook configured for this WABA or Phone ID' });
    }

    const messageId = 'wamid.' + uuidv4().replace(/-/g, '').substring(0, 24);
    
    const payload = {
        object: "whatsapp_business_account",
        entry: [{
            id: phone.waba_id,
            changes: [{
                value: {
                    messaging_product: "whatsapp",
                    metadata: {
                        display_phone_number: phone.display_phone_number,
                        phone_number_id: phone.id
                    },
                    contacts: [{
                        profile: { name: "Mock User" },
                        wa_id: from
                    }],
                    messages: [{
                        from: from,
                        id: messageId,
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        type: message_type,
                    }]
                },
                field: "messages"
            }]
        }]
    };

    if (message_type === 'text') {
        payload.entry[0].changes[0].value.messages[0].text = { body: text_body };
    } else if (message_type === 'image') {
        payload.entry[0].changes[0].value.messages[0].image = { 
            mime_type: "image/jpeg", 
            sha256: "fakehash", 
            id: "fake_media_id" 
        };
    }

    try {
        await webhookSender.sendWebhook(phone.waba_id, payload);
        res.json({ success: true, message_id: messageId, message: "Webhook triggered successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to trigger webhook", details: err.message });
    }
});

router.get('/dashboard', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mock Meta WA Server - Dashboard</title>
            <style>
                body { font-family: sans-serif; padding: 20px; max-width: 800px; margin: auto; }
                .card { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                input, select, button { margin-bottom: 10px; padding: 8px; width: 100%; box-sizing: border-box; }
                button { background: #25D366; color: white; border: none; cursor: pointer; font-weight: bold; }
                button:hover { background: #128C7E; }
                pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
            </style>
        </head>
        <body>
            <h1>WhatsApp Mock Server Dashboard</h1>
            
            <div class="card">
                <h2>1. Configure Webhook</h2>
                <input type="text" id="targetId" placeholder="WABA ID (e.g. 10000)" value="10000">
                <input type="text" id="webhookUrl" placeholder="Your Application Webhook URL (e.g. http://localhost:8080/webhook)">
                <input type="text" id="verifyToken" placeholder="Verify Token (Optional)">
                <button onclick="configureWebhook()">Set Webhook</button>
                <pre id="webhookResult"></pre>
            </div>

            <div class="card">
                <h2>2. Simulate Inbound Message</h2>
                <input type="text" id="phoneId" placeholder="To Phone Number ID (e.g. 100001)" value="100001">
                <input type="text" id="fromNumber" placeholder="From User Phone Number (e.g. 15550001111)" value="15550001111">
                <select id="messageType" onchange="toggleInputs()">
                    <option value="text">Text Message</option>
                    <option value="image">Image Message</option>
                </select>
                <input type="text" id="textBody" placeholder="Message Body">
                <button onclick="triggerMessage()">Send to Webhook</button>
                <pre id="messageResult"></pre>
            </div>

            <script>
                function toggleInputs() {
                    const type = document.getElementById('messageType').value;
                    document.getElementById('textBody').style.display = type === 'text' ? 'block' : 'none';
                }

                async function configureWebhook() {
                    const target_id = document.getElementById('targetId').value;
                    const url = document.getElementById('webhookUrl').value;
                    const verify_token = document.getElementById('verifyToken').value;
                    
                    const res = await fetch('/admin/configure_webhook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ target_id, url, verify_token })
                    });
                    const data = await res.json();
                    document.getElementById('webhookResult').textContent = JSON.stringify(data, null, 2);
                }

                async function triggerMessage() {
                    const phone_number_id = document.getElementById('phoneId').value;
                    const from = document.getElementById('fromNumber').value;
                    const message_type = document.getElementById('messageType').value;
                    const text_body = document.getElementById('textBody').value;
                    
                    const res = await fetch('/admin/trigger_message', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone_number_id, from, message_type, text_body })
                    });
                    const data = await res.json();
                    document.getElementById('messageResult').textContent = JSON.stringify(data, null, 2);
                }
            </script>
        </body>
        </html>
    `);
});

module.exports = router;
