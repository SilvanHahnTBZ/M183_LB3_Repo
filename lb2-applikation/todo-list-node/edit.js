const db = require('./fw/db');
const security = require('./fw/security');

async function getHtml(req) {
    const userId = security.getLoggedInUserId(req);

    if (!userId) {
        return '<h2>Not logged in</h2>';
    }

    const csrfToken = security.generateCsrfToken(req);

    let title = '';
    let state = '';
    let taskId = '';
    let html = '';
    const options = ['open', 'in progress', 'done'];

    if (req.query.id !== undefined) {
        taskId = String(req.query.id).trim();

        if (!security.isValidId(taskId)) {
            return '<h2>Invalid task id</h2>';
        }

        const conn = await db.connectDB();

        const [result] = await conn.execute(
            'SELECT ID, title, state FROM tasks WHERE ID = ? AND userID = ?',
            [taskId, userId]
        );

        if (result.length === 0) {
            return '<h2>Task not found or access denied</h2>';
        }

        title = result[0].title;
        state = result[0].state;

        html += '<h1>Edit Task</h1>';
    } else {
        html += '<h1>Create Task</h1>';
    }

    html += `
    <form id="form" method="post" action="savetask">
        <input type="hidden" name="id" value="${security.escapeHtml(taskId)}">
        <input type="hidden" name="csrfToken" value="${security.escapeHtml(csrfToken)}">

        <div class="form-group">
            <label for="title">Description</label>
            <input
                type="text"
                class="form-control size-medium"
                name="title"
                id="title"
                value="${security.escapeHtml(title)}"
                maxlength="${security.MAX_TASK_TITLE_LENGTH}"
                required
            >
        </div>

        <div class="form-group">
            <label for="state">State</label>
            <select name="state" id="state" class="size-auto" required>`;

    options.forEach(function(option) {
        const selected = state === option ? 'selected' : '';
        const label = ucfirst(option);

        html += `<option value="${security.escapeHtml(option)}" ${selected}>${security.escapeHtml(label)}</option>`;
    });

    html += `
            </select>
        </div>

        <div class="form-group">
            <label for="submit"></label>
            <input id="submit" type="submit" class="btn size-auto" value="Submit">
        </div>
    </form>

    <script>
        $(document).ready(function () {
            $('#form').validate({
                rules: {
                    title: {
                        required: true,
                        maxlength: ${security.MAX_TASK_TITLE_LENGTH}
                    },
                    state: {
                        required: true
                    }
                },
                messages: {
                    title: 'Please enter a description with maximum ${security.MAX_TASK_TITLE_LENGTH} characters.',
                    state: 'Please select a valid state.'
                },
                submitHandler: function (form) {
                    form.submit();
                }
            });
        });
    </script>`;

    return html;
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = { html: getHtml };