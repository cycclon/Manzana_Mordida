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
        const { id } = req.params;
        if(!id) res.status(400).json({message: 'Debe especificar un ID de sucursal'});
        const sucursal = await Sucursal.findById({ _id: id });
        if(!sucursal) return res.status(404).json({message: 'Sucursal no encontrada'});
        res.status(200).json(sucursal);

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
    try {
        const { provincia, localidad, barrio, direccion, googleMaps } = req.body;

        const nuevaSucursal = new Sucursal({
            provincia,
            localidad,
            barrio,
            direccion: {
                calle: direccion.calle,
                altura: direccion.altura,
                piso: direccion.piso,
                departamento: direccion.departamento,
                entreCalles: direccion.entreCalles,
                referencias: direccion.referencias
            },
            googleMaps
        });

        await nuevaSucursal.save();

        res.status(200).json({ message: 'Sucursal registrada correctamente.' });
    } catch (error) {
        next(error);
    }
}

async function editSucursal(req, res, next) {
    try {
        const { provincia, localidad, barrio, direccion, googleMaps } = req.body;
        const { id } = req.params;
        // Buscar sucursal por ID        
        const sucursal = await Sucursal.findById(id);
        
        if(!sucursal) return res.status(404).json({ message: 'Sucursal inexistente '});
        sucursal.provincia = provincia || sucursal.provincia;
        sucursal.localidad = localidad || sucursal.localidad;
        sucursal.barrio = barrio || sucursal.barrio;
        sucursal.direccion.calle = direccion.calle || sucursal.direccion.calle;
        sucursal.direccion.altura = direccion.altura || sucursal.direccion.altura;
        sucursal.direccion.piso = direccion.piso || sucursal.direccion.piso;
        sucursal.direccion.departamento = direccion.departamento || sucursal.direccion.departamento;
        sucursal.direccion.entreCalles = direccion.entreCalles || sucursal.direccion.entreCalles;
        sucursal.direccion.referencias = direccion. referencias || sucursal.direccion.referencias;
        sucursal.googleMaps = googleMaps || sucursal.googleMaps;
        
        await sucursal.save();        
        
        res.status(200).json({ message: 'Sucursal editada.' });
    } catch (error) {
        next(error);
    }
}

async function deleteSucursal(req, res, next) {
    try {
        const { id } = req.params;
        const result = await Sucursal.deleteOne({ _id: id });

        if( result.deletedCount===0 ) return res.status(404).json({ message: 'Sucursal inexistente '});

        res.status(200).json({ message: 'Sucursal eliminada.' });
    } catch (error) {
        next(error);
    }
}

module.exports = { 
    getSucursales, 
    getSucursalID, 
    getSucursalesLocalidad,
    addSucursal,
    editSucursal,
    deleteSucursal
}