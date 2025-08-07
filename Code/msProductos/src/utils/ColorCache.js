const Color = require('../schemas/ColorSchema');

let cachedColorIds = null;

async function getCachedColorIds() {
    if(!cachedColorIds) {
        const colors = await Color.find({}, '_id');
        cachedColorIds = new Set(colors.map(color => color._id.toString()));
    }
    return cachedColorIds;
}

// Llamar este método cuando cambie la colección de colores (CRUD)
function invalidateColorCache() { cachedColorIds = null;}

module.exports = { getCachedColorIds, invalidateColorCache };