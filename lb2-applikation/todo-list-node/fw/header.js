const security = require('./security');

async function getHtml(req) {
    let content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TBZ Secure App</title>
    <link rel="stylesheet" href="/style.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.1/jquery.validate.min.js"></script>
</head>
<body>
    <header>
        <div>TBZ Secure TODO App</div>`;

    if (security.isLoggedIn(req)) {
        content += `
        <nav>
            <ul>
                <li><a href="/">Tasks</a></li>`;

        if (security.isAdmin(req)) {
            content += `
                <li><a href="/admin/users">User List</a></li>`;
        }

        content += `
                <li><a href="/logout">Logout</a></li>
            </ul>
        </nav>`;
    }

    content += `
    </header>
    <main>`;

    return content;
}

module.exports = getHtml;