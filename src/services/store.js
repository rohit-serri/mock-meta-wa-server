class Store {
    constructor() {
        this.wabas = new Map(); // waba_id -> WABA details
        this.phoneNumbers = new Map(); // phone_number_id -> { number, verified_name, profile: {} }
        this.templates = new Map(); // waba_id -> list of templates
        this.media = new Map(); // media_id -> { path, type, size, hash }
        this.webhookUrls = new Map(); // phone_number_id or waba_id -> callback url
        this.webhookTokens = new Map(); // waba_id -> verify token
        this.flows = new Map(); // flow_id -> flow details
    }

    addWaba(id, name) {
        this.wabas.set(id, { id, name });
    }

    getWaba(id) {
        return this.wabas.get(id);
    }

    addPhoneNumber(wabaId, phoneId, displayPhoneNumber, verifiedName) {
        this.phoneNumbers.set(phoneId, {
            id: phoneId,
            waba_id: wabaId,
            display_phone_number: displayPhoneNumber,
            verified_name: verifiedName,
            quality_rating: "GREEN",
            status: "CONNECTED",
            profile: {
                about: "",
                address: "",
                description: "",
                email: "",
                profile_picture_url: "",
                websites: [],
                vertical: ""
            }
        });
    }

    getPhoneNumber(phoneId) {
        return this.phoneNumbers.get(phoneId);
    }
    
    updatePhoneProfile(phoneId, updates) {
        const phone = this.getPhoneNumber(phoneId);
        if (phone) {
            phone.profile = { ...phone.profile, ...updates };
        }
        return phone;
    }

    addTemplate(wabaId, template) {
        if (!this.templates.has(wabaId)) {
            this.templates.set(wabaId, []);
        }
        this.templates.get(wabaId).push(template);
    }

    getTemplates(wabaId) {
        return this.templates.get(wabaId) || [];
    }

    deleteTemplate(wabaId, templateName) {
        let list = this.templates.get(wabaId) || [];
        const initialLen = list.length;
        list = list.filter(t => t.name !== templateName);
        this.templates.set(wabaId, list);
        return initialLen > list.length;
    }

    setWebhookConfig(targetId, url, verifyToken) {
        this.webhookUrls.set(targetId, url);
        this.webhookTokens.set(targetId, verifyToken);
    }

    getWebhookConfig(targetId) {
        return {
            url: this.webhookUrls.get(targetId),
            verifyToken: this.webhookTokens.get(targetId)
        };
    }

    addMedia(mediaId, data) {
        this.media.set(mediaId, data);
    }

    getMedia(mediaId) {
        return this.media.get(mediaId);
    }
    
    deleteMedia(mediaId) {
        return this.media.delete(mediaId);
    }
    
    addFlow(flow) {
        this.flows.set(flow.id, flow);
    }
    
    getFlow(flowId) {
        return this.flows.get(flowId);
    }
    
    getWabaFlows(wabaId) {
        return Array.from(this.flows.values()).filter(f => f.waba_id === wabaId);
    }
    
    // Seed some initial data for testing out of the box
    seed() {
        this.addWaba("10000", "Test WABA");
        this.addPhoneNumber("10000", "100001", "1 555 123 4567", "Test Business");
        console.log("Store seeded with WABA 10000 and Phone ID 100001");
    }
}

const store = new Store();
store.seed();
module.exports = store;
