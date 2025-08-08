const Color = require('../schemas/ColorSchema');

let cachedColorMap = null;

async function getCachedColorMap() {
    if(!cachedColorMap) {
        const colors = await Color.find({}, '_id nombre');

        cachedColorMap = new Map();
        for(const color of colors) {
            cachedColorMap.set(color.nombre, color._id.toString());
        }
    }
    return cachedColorMap;
}

// Llamar este método cuando cambie la colección de colores (CRUD)
function invalidateColorCache() { cachedColorMap = null;}

module.exports = { getCachedColorMap, invalidateColorCache };