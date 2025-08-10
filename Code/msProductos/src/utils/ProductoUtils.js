const Producto = require('../schemas/ProductoSchema');
const colorCache = require('../utils/ColorCache');

// DEVUELVE UN PRODUCTO SEGUN SU NOMBRE
async function getProductoByName(name) {
    try {
        const producto = await Producto.findOne({ modelo: name});
        
        return producto;
    } catch (error) {
        throw error;
    }
};

// DEVUELVE UN ARRAY DE IDS DE COLORES SEGUN SU NOMBRE
// Dispara un error si algun nombre de color no se encuentra en la base de datos
// Requiere un array de nombres de colores
async function ValidarColoresIds(colores) {
    try {
        const cachedColors = await colorCache.getCachedColorMap();
        
        const colorIds = [];
        const notFound = [];

        // Recorrer mapa de colores en caché y agregar las ids de los colores que existen. Guardar los nombres de los colores queno existen en un array
        for(const name of colores) {
            if(cachedColors.has(name)) {
                colorIds.push(cachedColors.get(name));
            } else {
                notFound.push(name);
            }
        }

        // Si el array de colores no encontrados contiene algún valor, disparar un error
        if(notFound.length > 0){
            throw new Error(`Los siguientes colores no están registrados en la base de datos: ${notFound}`);
        }

        return colorIds        
    } catch (error) {
        throw error;
    }
};

module.exports = {getProductoByName, ValidarColoresIds};