const { sendGraphError } = require('./errors');

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendGraphError(res, 401, 'Invalid OAuth access token.', 'OAuthException', 190);
    }
    
    const token = authHeader.substring(7);
    if (process.env.VALID_TOKEN && token !== process.env.VALID_TOKEN) {
        return sendGraphError(res, 401, 'Error validating access token: The session has been invalidated.', 'OAuthException', 190, 460);
    }

    req.token = token;
    next();
}

module.exports = { requireAuth };
