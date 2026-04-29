const { v4: uuidv4 } = require('uuid');

function createGraphError(message, type, code, error_subcode = null) {
    const error = {
        message,
        type,
        code,
        fbtrace_id: uuidv4().replace(/-/g, '').substring(0, 11).toUpperCase()
    };
    if (error_subcode !== null) {
        error.error_subcode = error_subcode;
    }
    return { error };
}

function sendGraphError(res, statusCode, message, type, code, error_subcode = null) {
    res.status(statusCode).json(createGraphError(message, type, code, error_subcode));
}

module.exports = { createGraphError, sendGraphError };
