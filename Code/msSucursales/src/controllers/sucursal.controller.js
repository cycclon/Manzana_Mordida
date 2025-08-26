const Sucursal = require('../schemas/sucursal.model');

async function getSucursales(req, res, next) {
    try {
        const sucursales = await Sucursal.find({});

        res.status(200).json(sucursales);
    } catch (error) {
        next(error);
    }
}

async function getSucursalID(req, res, next) {
    try {
        console.log('getSucursalId');
        
        const { id } = req.params;
        if(!id) res.status(400).json({message: 'Debe especificar un ID de sucursal'});
        const sucursal = await Sucursal.findById({ _id: id });
        if(!sucursal) return res.status(404).json({message: 'Sucursal no encontrada'});
        res.stauts(200).json(sucursal);

        res.status(200).json({message: 'ok'});
    } catch (error) {
        next(error);
    }
}

async function getSucursalesLocalidad(req, res, next) {
    try {
        const { provloc } = req.params;
        if(!provloc) return res.status(400).json({message: 'Debe especificar una provincia y localidad'});
        if(!provloc.includes('-')) return res.status(400).json({message: 'Debe especificar una provincia y localidad'});

        const provLoc = provloc.split('-');
        const sucursales = await Sucursal.find({ provincia: provLoc[0], localidad: provLoc[1] });

        if(sucursales.length === 0) return res.status(404).json({message: 'Sucursales no encontradas'});

        res.status(200).json(sucursales);
    } catch (error) {
        next(error);
    }
}

async function addSucursal(req, res, next) {

}

async function editSucursal(req, res, next) {

}

async function deleteSucursal(req, res, next) {

}

module.exports = { 
    getSucursales, 
    getSucursalID, 
    getSucursalesLocalidad,
    addSucursal,
    editSucursal,
    deleteSucursal
}