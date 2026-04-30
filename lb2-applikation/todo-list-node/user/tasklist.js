const db = require('../fw/db');
const security = require('../fw/security');

async function getHtml(req) {
    const userId = security.getLoggedInUserId(req);

    if (!userId) {
        return '<h2>Not logged in</h2>';
    }

    const csrfToken = security.generateCsrfToken(req);

    let html = `
    <section id="list">
        <a href="edit">Create Task</a>
        <table>
            <tr>
                <th>ID</th>
                <th>Description</th>
                <th>State</th>
                <th></th>
            </tr>
    `;

    const conn = await db.connectDB();

    const [result] = await conn.execute(
        'SELECT ID, title, state FROM tasks WHERE userID = ?',
        [userId]
    );

    result.forEach(function(row) {
        html += `
            <tr>
                <td>${security.escapeHtml(row.ID)}</td>
                <td class="wide">${security.escapeHtml(row.title)}</td>
                <td>${ucfirst(security.escapeHtml(row.state))}</td>
                <td>
                    <a href="edit?id=${security.escapeHtml(row.ID)}">edit</a>

                    <form method="post" action="/delete" style="display:inline;">
                        <input type="hidden" name="id" value="${security.escapeHtml(row.ID)}">
                        <input type="hidden" name="csrfToken" value="${security.escapeHtml(csrfToken)}">
                        <button type="submit" onclick="return confirm('Delete this task?');">delete</button>
                    </form>
                </td>
            </tr>`;
    });

    html += `
        </table>
    </section>`;

    return html;
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    html: getHtml
};