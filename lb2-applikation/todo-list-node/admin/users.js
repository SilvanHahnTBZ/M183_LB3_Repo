const db = require('../fw/db');
const security = require('../fw/security');

async function getHtml(req) {
    const conn = await db.connectDB();

    const [result] = await conn.execute(`
        SELECT users.ID, users.username, roles.title
        FROM users
        INNER JOIN permissions ON users.ID = permissions.userID
        INNER JOIN roles ON permissions.roleID = roles.ID
        ORDER BY users.username
    `);

    let html = `
    <h2>User List</h2>

    <table>
        <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
        </tr>`;

    result.forEach(function (record) {
        html += `
        <tr>
            <td>${security.escapeHtml(record.ID)}</td>
            <td>${security.escapeHtml(record.username)}</td>
            <td>${security.escapeHtml(record.title)}</td>
        </tr>`;
    });

    html += `
    </table>`;

    return html;
}

module.exports = { html: getHtml };