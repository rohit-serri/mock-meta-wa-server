const express = require('express');
const { requireAuth } = require('../utils/auth');
const store = require('../services/store');
const webhookSender = require('../services/webhookSender');
const { sendGraphError } = require('../utils/errors');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // simple temp storage

router.use(requireAuth);

// Outbound Messages
router.post('/:phone_number_id/messages', (req, res) => {
    const { phone_number_id } = req.params;
    const body = req.body;
    
    const phone = store.getPhoneNumber(phone_number_id);
    if (!phone) return sendGraphError(res, 400, 'Invalid phone_number_id.', 'OAuthException', 100);
    
    if (body.messaging_product !== 'whatsapp') return sendGraphError(res, 400, 'messaging_product must be whatsapp', 'OAuthException', 100);
    if (!body.to) return sendGraphError(res, 400, 'Missing recipient phone number (to)', 'OAuthException', 100);
    
    const type = body.type || 'text';
    
    // Minimal structural validation
    if (type === 'text' && (!body.text || !body.text.body)) {
        return sendGraphError(res, 400, 'Missing text.body payload for text message', 'OAuthException', 100);
    } else if (type === 'template' && (!body.template || !body.template.name || !body.template.language)) {
        return sendGraphError(res, 400, 'Missing template name or language', 'OAuthException', 100);
    } else if (['image', 'video', 'audio', 'document', 'sticker'].includes(type) && (!body[type] || (!body[type].id && !body[type].link))) {
        return sendGraphError(res, 400, `Missing id or link for ${type} message`, 'OAuthException', 100);
    } else if (type === 'interactive' && (!body.interactive || !body.interactive.type)) {
        return sendGraphError(res, 400, 'Missing interactive type', 'OAuthException', 100);
    } else if (type === 'contacts' && (!body.contacts || !Array.isArray(body.contacts))) {
        return sendGraphError(res, 400, 'Contacts must be an array', 'OAuthException', 100);
    } else if (type === 'location' && (!body.location || !body.location.latitude || !body.location.longitude)) {
        return sendGraphError(res, 400, 'Location must have latitude and longitude', 'OAuthException', 100);
    } else if (type === 'reaction' && (!body.reaction || !body.reaction.message_id || typeof body.reaction.emoji === 'undefined')) {
        return sendGraphError(res, 400, 'Reaction must have message_id and emoji', 'OAuthException', 100);
    }

    const messageId = 'wamid.' + uuidv4().replace(/-/g, '').substring(0, 24);
    
    res.status(200).json({
        messaging_product: 'whatsapp',
        contacts: [{ input: body.to, wa_id: body.to }],
        messages: [{ id: messageId }]
    });

    const to = body.to;
    setTimeout(() => webhookSender.sendWebhook(phone.waba_id, webhookSender.createMessageStatusPayload(phone_number_id, messageId, to, 'sent')), 500);
    setTimeout(() => webhookSender.sendWebhook(phone.waba_id, webhookSender.createMessageStatusPayload(phone_number_id, messageId, to, 'delivered')), 1500);
    setTimeout(() => webhookSender.sendWebhook(phone.waba_id, webhookSender.createMessageStatusPayload(phone_number_id, messageId, to, 'read')), 3000);
});

// Upload Media
router.post('/:phone_number_id/media', upload.single('file'), (req, res) => {
    const { phone_number_id } = req.params;
    
    if (!req.file) return sendGraphError(res, 400, 'Missing file parameter.', 'OAuthException', 100);
    if (req.body.messaging_product !== 'whatsapp') return sendGraphError(res, 400, 'messaging_product must be whatsapp', 'OAuthException', 100);
    
    const mediaId = uuidv4().replace(/-/g, '').substring(0, 16);
    store.addMedia(mediaId, {
        id: mediaId,
        path: req.file.path,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
        hash: require('crypto').createHash('sha256').update(req.file.path).digest('hex') // Fake hash
    });
    
    res.json({ id: mediaId });
});

// Get Media Info
router.get('/:media_id', (req, res) => {
    const media = store.getMedia(req.params.media_id);
    if (!media) return sendGraphError(res, 404, 'Media not found.', 'OAuthException', 100);
    
    res.json({
        url: `http://localhost:${process.env.PORT || 3000}/v17.0/${media.id}/download`,
        mime_type: media.mime_type,
        sha256: media.hash,
        file_size: media.file_size,
        id: media.id,
        messaging_product: 'whatsapp'
    });
});

// Download Media
router.get('/:media_id/download', (req, res) => {
    const media = store.getMedia(req.params.media_id);
    if (!media) return sendGraphError(res, 404, 'Media not found.', 'OAuthException', 100);
    res.sendFile(require('path').resolve(media.path));
});

// Delete Media
router.delete('/:media_id', (req, res) => {
    const deleted = store.deleteMedia(req.params.media_id);
    res.json({ success: deleted });
});


// Create Template
router.post('/:waba_id/message_templates', (req, res) => {
    const wabaId = req.params.waba_id;
    const body = req.body;
    
    if (!body.name || !body.category || !body.components || !body.language) {
        return sendGraphError(res, 400, 'Missing required fields for template creation', 'OAuthException', 100);
    }
    
    const templateId = Array.from(Array(15)).map(() => Math.floor(Math.random() * 10)).join('');
    
    const newTemplate = {
        id: templateId,
        name: body.name,
        category: body.category,
        language: body.language,
        components: body.components,
        status: "APPROVED"
    };
    
    store.addTemplate(wabaId, newTemplate);
    res.json({ id: templateId, status: "APPROVED", category: body.category });
});

// Get Templates
router.get('/:waba_id/message_templates', (req, res) => {
    const wabaId = req.params.waba_id;
    const templates = store.getTemplates(wabaId);
    
    let filtered = templates;
    if (req.query.name) filtered = filtered.filter(t => t.name === req.query.name);
    
    res.json({ data: filtered, paging: { cursors: { before: "", after: "" } } });
});

// Delete Template
router.delete('/:waba_id/message_templates', (req, res) => {
    const wabaId = req.params.waba_id;
    const { name } = req.query;
    
    if (!name) return sendGraphError(res, 400, 'Missing name parameter for template deletion', 'OAuthException', 100);
    
    const success = store.deleteTemplate(wabaId, name);
    res.json({ success });
});

// Update Template
router.post('/:waba_id/message_templates/:template_id', (req, res) => {
    const { waba_id, template_id } = req.params;
    const body = req.body;
    
    if (!body.components) {
        return sendGraphError(res, 400, 'Missing components for template update', 'OAuthException', 100);
    }
    
    let templates = store.getTemplates(waba_id);
    let template = templates.find(t => t.id === template_id);
    
    if (!template) {
        return sendGraphError(res, 404, 'Template not found', 'OAuthException', 100);
    }
    
    if (body.category) template.category = body.category;
    template.components = body.components;
    
    res.json({ id: template.id, status: "APPROVED", category: template.category });
});

// Get Business Profile
router.get('/:phone_number_id/whatsapp_business_profile', (req, res) => {
    const phone = store.getPhoneNumber(req.params.phone_number_id);
    if (!phone) return sendGraphError(res, 400, 'Invalid phone number ID.', 'OAuthException', 100);
    
    const fields = req.query.fields ? req.query.fields.split(',') : ['about', 'address', 'description', 'email', 'profile_picture_url', 'websites', 'vertical'];
    
    let responseData = { messaging_product: "whatsapp" };
    fields.forEach(f => {
        if (phone.profile[f] !== undefined) responseData[f] = phone.profile[f];
    });
    
    res.json({ data: [responseData] });
});

// Update Business Profile
router.post('/:phone_number_id/whatsapp_business_profile', (req, res) => {
    const phone = store.getPhoneNumber(req.params.phone_number_id);
    if (!phone) return sendGraphError(res, 400, 'Invalid phone number ID.', 'OAuthException', 100);
    if (req.body.messaging_product !== 'whatsapp') return sendGraphError(res, 400, 'messaging_product must be whatsapp', 'OAuthException', 100);
    
    store.updatePhoneProfile(req.params.phone_number_id, req.body);
    res.json({ success: true });
});

// List Phone Numbers
router.get('/:waba_id/phone_numbers', (req, res) => {
    const { waba_id } = req.params;
    const allPhones = Array.from(store.phoneNumbers.values());
    const wabaPhones = allPhones.filter(p => p.waba_id === waba_id);
    
    // Format according to Meta specs
    const data = wabaPhones.map(p => ({
        id: p.id,
        display_phone_number: p.display_phone_number,
        verified_name: p.verified_name,
        quality_rating: p.quality_rating,
        status: p.status
    }));
    
    res.json({ data, paging: { cursors: { before: "", after: "" } } });
});

// Phone Number Verification & Registration
router.post('/:phone_number_id/request_code', (req, res) => {
    const phone = store.getPhoneNumber(req.params.phone_number_id);
    if (!phone) return sendGraphError(res, 400, 'Invalid phone number ID.', 'OAuthException', 100);
    if (!req.body.code_method) return sendGraphError(res, 400, 'Missing code_method', 'OAuthException', 100);
    
    // In a real system, this sends an SMS or Voice call.
    res.json({ success: true });
});

router.post('/:phone_number_id/verify_code', (req, res) => {
    const phone = store.getPhoneNumber(req.params.phone_number_id);
    if (!phone) return sendGraphError(res, 400, 'Invalid phone number ID.', 'OAuthException', 100);
    if (!req.body.code) return sendGraphError(res, 400, 'Missing code', 'OAuthException', 100);
    
    // Accept any code for the mock
    phone.status = "VERIFIED";
    res.json({ success: true });
});

router.post('/:phone_number_id/register', (req, res) => {
    const phone = store.getPhoneNumber(req.params.phone_number_id);
    if (!phone) return sendGraphError(res, 400, 'Invalid phone number ID.', 'OAuthException', 100);
    if (req.body.messaging_product !== 'whatsapp') return sendGraphError(res, 400, 'messaging_product must be whatsapp', 'OAuthException', 100);
    if (!req.body.pin) return sendGraphError(res, 400, 'Missing registration pin', 'OAuthException', 100);
    
    phone.status = "CONNECTED";
    res.json({ success: true });
});

router.post('/:phone_number_id/deregister', (req, res) => {
    const phone = store.getPhoneNumber(req.params.phone_number_id);
    if (!phone) return sendGraphError(res, 400, 'Invalid phone number ID.', 'OAuthException', 100);
    
    phone.status = "DEREGISTERED";
    res.json({ success: true });
});

// WhatsApp Flows
router.post('/:waba_id/flows', (req, res) => {
    const { waba_id } = req.params;
    const { name, categories } = req.body;
    
    if (!name || !categories) return sendGraphError(res, 400, 'Missing name or categories', 'OAuthException', 100);
    
    const flowId = Array.from(Array(15)).map(() => Math.floor(Math.random() * 10)).join('');
    const newFlow = {
        id: flowId,
        waba_id,
        name,
        status: "DRAFT",
        categories,
        json_assets: []
    };
    
    store.addFlow(newFlow);
    res.json({ id: flowId, name, status: "DRAFT" });
});

router.get('/:waba_id/flows', (req, res) => {
    const { waba_id } = req.params;
    const flows = store.getWabaFlows(waba_id);
    
    res.json({ data: flows, paging: { cursors: { before: "", after: "" } } });
});

router.post('/:flow_id/assets', upload.single('file'), (req, res) => {
    const { flow_id } = req.params;
    const flow = store.getFlow(flow_id);
    
    if (!flow) return sendGraphError(res, 404, 'Flow not found', 'OAuthException', 100);
    if (!req.file) return sendGraphError(res, 400, 'Missing asset file', 'OAuthException', 100);
    
    flow.json_assets.push({
        id: uuidv4().replace(/-/g, ''),
        path: req.file.path,
        timestamp: Date.now()
    });
    
    res.json({ success: true, message: "Asset uploaded" });
});

router.post('/:flow_id/publish', (req, res) => {
    const { flow_id } = req.params;
    const flow = store.getFlow(flow_id);
    
    if (!flow) return sendGraphError(res, 404, 'Flow not found', 'OAuthException', 100);
    if (flow.json_assets.length === 0) return sendGraphError(res, 400, 'Cannot publish flow without assets', 'OAuthException', 100);
    
    flow.status = "PUBLISHED";
    res.json({ success: true, status: "PUBLISHED" });
});

// Analytics & Account Metrics
router.get('/:waba_id/conversation_analytics', (req, res) => {
    const { waba_id } = req.params;
    const { start, end, dimensions } = req.query;
    
    if (!start || !end) return sendGraphError(res, 400, 'Missing start or end timestamp', 'OAuthException', 100);
    
    // Mock analytics response
    const mockData = {
        conversation_analytics: {
            data: [
                {
                    data_points: [
                        {
                            start: parseInt(start),
                            end: parseInt(end),
                            conversation: 15,
                            cost: 0.50
                        }
                    ],
                    dimensions: {
                        conversation_category: "authentication",
                        conversation_direction: "business_initiated"
                    }
                },
                {
                    data_points: [
                        {
                            start: parseInt(start),
                            end: parseInt(end),
                            conversation: 42,
                            cost: 1.25
                        }
                    ],
                    dimensions: {
                        conversation_category: "utility",
                        conversation_direction: "business_initiated"
                    }
                }
            ]
        }
    };
    
    res.json(mockData);
});

module.exports = router;
