const tasklist = require('./user/tasklist');
const bgSearch = require('./user/backgroundsearch');
const security = require('./fw/security');

async function getHtml(req) {
    const username = req.session.user.username;

    let taskListHtml = await tasklist.html(req);

    return `
        <h2>Welcome, ${security.escapeHtml(username)}!</h2>
        ${taskListHtml}
        <hr />
        ${bgSearch.html(req)}
    `;
}

module.exports = {
    html: getHtml
};