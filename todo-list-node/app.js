const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');

const header = require('./fw/header');
const footer = require('./fw/footer');
const security = require('./fw/security');

const login = require('./login');
const index = require('./index');
const adminUser = require('./admin/users');
const editTask = require('./edit');
const saveTask = require('./savetask');
const deleteTask = require('./delete');
const search = require('./search');
const searchProvider = require('./search/v2/index');

const app = express();
const PORT = 3000;

/* =========================
   SECURITY HEADERS (HELMET)
========================= */
app.use(helmet({
    contentSecurityPolicy: false
}));

/* =========================
   SESSION SECURITY
========================= */
app.use(session({
    name: 'session-id',
    secret: process.env.SESSION_SECRET || 'very-strong-secret-1234567890',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));

/* =========================
   MIDDLEWARE
========================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* =========================
   ROUTES
========================= */

/* HOME */
app.get('/', async (req, res) => {
    if (!security.isLoggedIn(req)) {
        return res.redirect('/login');
    }

    const html = await wrapContent(await index.html(req), req);
    res.send(html);
});

app.post('/', async (req, res) => {
    if (!security.isLoggedIn(req)) {
        return res.redirect('/login');
    }

    const html = await wrapContent(await index.html(req), req);
    res.send(html);
});

/* ADMIN */
app.get('/admin/users', async (req, res) => {
    if (!security.isLoggedIn(req)) {
        return res.redirect('/login');
    }

    if (!security.isAdmin(req)) {
        return res.status(403).send(await wrapContent('<h2>Access denied</h2>', req));
    }

    const html = await wrapContent(await adminUser.html(req), req);
    res.send(html);
});

/* EDIT TASK */
app.get('/edit', async (req, res) => {
    if (!security.isLoggedIn(req)) {
        return res.redirect('/login');
    }

    const html = await wrapContent(await editTask.html(req), req);
    res.send(html);
});

/* DELETE TASK (POST ONLY!) */
app.post('/delete', async (req, res) => {
    if (!security.isLoggedIn(req)) {
        return res.redirect('/login');
    }

    const html = await wrapContent(await deleteTask.html(req), req);
    res.send(html);
});

/* LOGIN */
app.get('/login', async (req, res) => {
    if (security.isLoggedIn(req)) {
        return res.redirect('/');
    }

    const content = await login.handleLogin(req, res);

    if (content.user.userid !== 0) {
        req.session.user = content.user;
        return res.redirect('/');
    }

    const html = await wrapContent(content.html, req);
    res.send(html);
});

app.post('/login', async (req, res) => {
    if (security.isLoggedIn(req)) {
        return res.redirect('/');
    }

    const content = await login.handleLogin(req, res);

    if (content.user.userid !== 0) {
        req.session.user = content.user;
        return res.redirect('/');
    }

    const html = await wrapContent(content.html, req);
    res.send(html);
});

/* LOGOUT */
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('session-id');
        res.redirect('/login');
    });
});

/* PROFILE */
app.get('/profile', (req, res) => {
    if (!security.isLoggedIn(req)) {
        return res.redirect('/login');
    }

    res.send(`Welcome, ${security.escapeHtml(req.session.user.username)}! <a href="/logout">Logout</a>`);
});

/* SAVE TASK */
app.post('/savetask', async (req, res) => {
    if (!security.isLoggedIn(req)) {
        return res.redirect('/login');
    }

    const html = await wrapContent(await saveTask.html(req), req);
    res.send(html);
});

/* SEARCH */
app.post('/search', async (req, res) => {
    if (!security.isLoggedIn(req)) {
        return res.status(401).send('Not authenticated');
    }

    const html = await search.html(req);
    res.send(html);
});

/* SEARCH V2 */
app.get('/search/v2/', async (req, res) => {
    if (!security.isLoggedIn(req)) {
        return res.status(401).send('Not authenticated');
    }

    const result = await searchProvider.search(req);
    res.send(result);
});

/* =========================
   SERVER START
========================= */
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

/* =========================
   TEMPLATE WRAPPER
========================= */
async function wrapContent(content, req) {
    const headerHtml = await header(req);
    return headerHtml + content + footer;
}