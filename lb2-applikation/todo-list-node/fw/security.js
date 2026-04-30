const crypto = require('crypto');

const MAX_TASK_TITLE_LENGTH = 255;
const MAX_SEARCH_TERMS_LENGTH = 100;
const MAX_USERNAME_LENGTH = 255;
const MAX_PASSWORD_LENGTH = 255;

function escapeHtml(value) {
    if (value === undefined || value === null) {
        return '';
    }

    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function isValidId(value) {
    return /^[0-9]+$/.test(String(value));
}

function isValidTaskState(value) {
    return ['open', 'in progress', 'done'].includes(String(value).toLowerCase().trim());
}

function normalizeTaskState(value) {
    return String(value || '').toLowerCase().trim();
}

function isValidTaskTitle(value) {
    const title = String(value || '').trim();

    if (title.length === 0) {
        return false;
    }

    if (title.length > MAX_TASK_TITLE_LENGTH) {
        return false;
    }

    return true;
}

function isValidSearchTerm(value) {
    const terms = String(value || '').trim();

    if (terms.length === 0) {
        return false;
    }

    if (terms.length > MAX_SEARCH_TERMS_LENGTH) {
        return false;
    }

    return true;
}

function isValidLoginInput(username, password) {
    const cleanUsername = String(username || '').trim();
    const cleanPassword = String(password || '');

    if (cleanUsername.length === 0 || cleanPassword.length === 0) {
        return false;
    }

    if (cleanUsername.length > MAX_USERNAME_LENGTH || cleanPassword.length > MAX_PASSWORD_LENGTH) {
        return false;
    }

    return true;
}

function getLoggedInUserId(req) {
    if (!req.session || !req.session.user || !req.session.user.userid) {
        return null;
    }

    return req.session.user.userid;
}

function isLoggedIn(req) {
    return getLoggedInUserId(req) !== null;
}

function isAdmin(req) {
    return req.session &&
        req.session.user &&
        req.session.user.roleid === 1;
}

function generateCsrfToken(req) {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }

    return req.session.csrfToken;
}

function validateCsrfToken(req) {
    if (!req.session || !req.session.csrfToken) {
        return false;
    }

    if (!req.body || !req.body.csrfToken) {
        return false;
    }

    return req.session.csrfToken === req.body.csrfToken;
}

module.exports = {
    escapeHtml,
    isValidId,
    isValidTaskState,
    normalizeTaskState,
    isValidTaskTitle,
    isValidSearchTerm,
    isValidLoginInput,
    getLoggedInUserId,
    isLoggedIn,
    isAdmin,
    generateCsrfToken,
    validateCsrfToken,
    MAX_TASK_TITLE_LENGTH,
    MAX_SEARCH_TERMS_LENGTH
};