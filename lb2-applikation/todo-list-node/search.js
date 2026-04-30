const searchProvider = require('./search/v2/index');
const security = require('./fw/security');

async function getHtml(req) {
    if (req.body.terms === undefined) {
        return 'Not enough information provided';
    }

    const terms = String(req.body.terms).trim();

    if (!security.isValidSearchTerm(terms)) {
        return 'Invalid search terms. Search terms must not be empty and may contain maximum 100 characters.';
    }

    const providerRequest = {
        session: req.session,
        query: {
            terms: terms
        }
    };

    return await searchProvider.search(providerRequest);
}

module.exports = { html: getHtml };