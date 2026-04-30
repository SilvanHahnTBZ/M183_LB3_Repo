const db = require('../../fw/db');
const security = require('../../fw/security');

async function search(req) {
    const userId = security.getLoggedInUserId(req);

    if (!userId) {
        return 'Not authenticated';
    }

    if (req.query.terms === undefined) {
        return 'No search terms provided';
    }

    const terms = String(req.query.terms).trim();

    if (!security.isValidSearchTerm(terms)) {
        return 'Invalid search terms. Search terms must not be empty and may contain maximum 100 characters.';
    }

    const conn = await db.connectDB();

    const [rows] = await conn.execute(
        'SELECT ID, title, state FROM tasks WHERE userID = ? AND title LIKE ?',
        [userId, `%${terms}%`]
    );

    let result = '';

    rows.forEach(function(row) {
        result += security.escapeHtml(row.title) + ' (' + security.escapeHtml(row.state) + ')<br>';
    });

    return result || 'No results found';
}

module.exports = {
    search: search
};