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

    const title = req.body.title ? String(req.body.title).trim() : '';
    const state = req.body.state ? security.normalizeTaskState(req.body.state) : '';
    const taskId = req.body.id ? String(req.body.id).trim() : '';

    if (!security.isValidTaskTitle(title)) {
        return "<span class='info info-error'>Invalid task title. The title must not be empty and may contain maximum 255 characters.</span><br><a href='/'>Back to task list</a>";
    }

    if (!security.isValidTaskState(state)) {
        return "<span class='info info-error'>Invalid task state</span><br><a href='/'>Back to task list</a>";
    }

    if (taskId !== '' && !security.isValidId(taskId)) {
        return "<span class='info info-error'>Invalid task id</span><br><a href='/'>Back to task list</a>";
    }

    const conn = await db.connectDB();

    if (taskId === '') {
        await conn.execute(
            'INSERT INTO tasks (title, state, userID) VALUES (?, ?, ?)',
            [title, state, userId]
        );
    } else {
        const [existingTask] = await conn.execute(
            'SELECT ID FROM tasks WHERE ID = ? AND userID = ?',
            [taskId, userId]
        );

        if (existingTask.length === 0) {
            return "<span class='info info-error'>Task not found or access denied</span><br><a href='/'>Back to task list</a>";
        }

        await conn.execute(
            'UPDATE tasks SET title = ?, state = ? WHERE ID = ? AND userID = ?',
            [title, state, taskId, userId]
        );
    }

    return "<span class='info info-success'>Update successful</span><br><a href='/'>Back to task list</a>";
}

module.exports = { html: getHtml };