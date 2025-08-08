const Producto = require('../schemas/ProductoSchema');

// DEVUELVE UN PRODUCTO SEGUN SU NOMBRE
async function getProductoByName(name) {
    try {
        const producto = await Producto.findOne({ modelo: name});
        
        return producto;
    } catch (error) {
        throw error;
    }
};

module.exports = {getProductoByName};