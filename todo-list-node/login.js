const bcrypt = require('bcrypt');
const db = require('./fw/db');
const security = require('./fw/security');

const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 5 * 60 * 1000;

async function handleLogin(req, res) {
    let msg = '';
    let user = { username: '', userid: 0, roleid: 0, rolename: '' };

    const username = req.body.username;
    const password = req.body.password;

    if (typeof username !== 'undefined' && typeof password !== 'undefined') {
        const result = await validateLogin(username, password);

        if (result.valid) {
            clearLoginAttempts(username);

            user.username = result.username;
            user.userid = result.userId;
            user.roleid = result.roleId;
            user.rolename = result.roleName;
        } else {
            registerFailedAttempt(username);
            msg = `<span class="info info-error">${security.escapeHtml(result.msg)}</span>`;
        }
    }

    return { html: msg + getHtml(), user: user };
}

async function validateLogin(username, password) {
    const result = {
        valid: false,
        msg: 'Invalid username or password',
        userId: 0,
        username: '',
        roleId: 0,
        roleName: ''
    };

    if (!security.isValidLoginInput(username, password)) {
        result.msg = 'Invalid username or password';
        return result;
    }

    if (isBlocked(username)) {
        result.msg = 'Too many failed login attempts. Please try again later.';
        return result;
    }

    const dbConnection = await db.connectDB();

    const sql = `
        SELECT users.ID AS userId,
               users.username AS username,
               users.password AS password,
               roles.ID AS roleId,
               roles.title AS roleName
        FROM users
        INNER JOIN permissions ON users.ID = permissions.userID
        INNER JOIN roles ON permissions.roleID = roles.ID
        WHERE users.username = ?
        LIMIT 1
    `;

    try {
        const [results] = await dbConnection.execute(sql, [String(username).trim()]);

        if (results.length === 0) {
            return result;
        }

        const dbUser = results[0];
        const match = await bcrypt.compare(String(password), dbUser.password);

        if (match) {
            result.valid = true;
            result.msg = 'Login correct';
            result.userId = dbUser.userId;
            result.username = dbUser.username;
            result.roleId = dbUser.roleId;
            result.roleName = dbUser.roleName;
        }
    } catch (err) {
        console.error('Login error:', err);
        result.msg = 'Login failed';
    }

    return result;
}

function registerFailedAttempt(username) {
    const key = normalizeUsername(username);

    if (!loginAttempts[key]) {
        loginAttempts[key] = {
            count: 0,
            lockedUntil: null
        };
    }

    loginAttempts[key].count += 1;

    if (loginAttempts[key].count >= MAX_ATTEMPTS) {
        loginAttempts[key].lockedUntil = Date.now() + LOCK_TIME_MS;
    }
}

function clearLoginAttempts(username) {
    const key = normalizeUsername(username);
    delete loginAttempts[key];
}

function isBlocked(username) {
    const key = normalizeUsername(username);
    const record = loginAttempts[key];

    if (!record || !record.lockedUntil) {
        return false;
    }

    if (Date.now() > record.lockedUntil) {
        delete loginAttempts[key];
        return false;
    }

    return true;
}

function normalizeUsername(username) {
    return String(username || '').trim().toLowerCase();
}

function getHtml() {
    return `
    <h2>Login</h2>

    <form id="form" method="post" action="/login">
        <div class="form-group">
            <label for="username">Username</label>
            <input
                type="text"
                class="form-control size-medium"
                name="username"
                id="username"
                autocomplete="username"
                maxlength="255"
                required
            >
        </div>

        <div class="form-group">
            <label for="password">Password</label>
            <input
                type="password"
                class="form-control size-medium"
                name="password"
                id="password"
                autocomplete="current-password"
                maxlength="255"
                required
            >
        </div>

        <div class="form-group">
            <label for="submit"></label>
            <input id="submit" type="submit" class="btn size-auto" value="Login">
        </div>
    </form>`;
}

module.exports = {
    handleLogin
};