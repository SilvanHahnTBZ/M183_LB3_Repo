const db = require('./fw/db');
const security = require('./fw/security');

async function getHtml(req) {
    const userId = security.getLoggedInUserId(req);

    if (!userId) {
        return "<span class='info info-error'>Not logged in</span>";
    }

    if (!security.validateCsrfToken(req)) {
        return "<span class='info info-error'>Invalid CSRF token</span>";
    }

    const taskId = req.body.id ? String(req.body.id).trim() : '';

    if (!security.isValidId(taskId)) {
        return "<span class='info info-error'>Invalid task id</span>";
    }

    const conn = await db.connectDB();

    const [existingTask] = await conn.execute(
        'SELECT ID FROM tasks WHERE ID = ? AND userID = ?',
        [taskId, userId]
    );

    if (existingTask.length === 0) {
        return "<span class='info info-error'>Task not found or access denied</span>";
    }

    await conn.execute(
        'DELETE FROM tasks WHERE ID = ? AND userID = ?',
        [taskId, userId]
    );

    return "<span class='info info-success'>Task deleted successfully</span><br><a href='/'>Back to task list</a>";
}

module.exports = { html: getHtml };