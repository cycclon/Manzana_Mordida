const PrecioCanje = require('../schemas/precioCanje.schema');

async function getPreciosCanjes(req, res, next) {
    try {
        const preciosCanjes = await PrecioCanje.find({});

        res.status(200).json(preciosCanjes);
    } catch (error) {
        next(error);
    }
}

async function getLineas(req, res, next) {
    try {
        const lineas = await PrecioCanje.distinct('linea');
        res.status(200).json(lineas);
    } catch (error) {
        next(error);
    }
}

async function getModelos(req, res, next) {
    try {
        const { linea } = req.params;
        const modelos = await PrecioCanje.distinct('modelo', { linea: linea });

        res.status(200).json(modelos);
    } catch (error) {
        next(error);
    }
}

async function addPrecioCanje(req, res, next) {
    try {        
        const { linea, modelo, bateriaMin, bateriaMax, precioCanje } = req.body;
        
        const nuevoPrecioCanje = new PrecioCanje({
            linea,
            modelo,
            bateriaMin,
            bateriaMax,
            precioCanje
        });
        
        await nuevoPrecioCanje.save();
        res.status(200).json({ message: 'Precio de canje registrado.' });
    } catch (error) {
        next(error);
    }
}

async function deletePrecioCanje(req, res, next) {
    try {
        const { id } = req.params;
        const result = await PrecioCanje.deleteOne({ _id: id });

        if(result.deletedCount === 0) return res.status(404).json({ message: 'No se encontró el precio de canje.'});

        res.status(201).json({ message: 'Precio de canje eliminado.'});
    } catch (error) {
        next(error);
    }
}

async function editPrecioCanje(req, res, next) {
    try {
        const { id } = req.params;
        const { precioCanje } = req.body;
        const canje = await PrecioCanje.findById(id);

        if(!precioCanje) return res.status(404).json({ message: 'Canje no encontrado.'});

        canje.precioCanje = precioCanje;

        await canje.save();
        res.status(201).json({ message: 'Precio de canje actualizado.'});
    } catch (error) {
        next(error);
    }
}

module.exports = { 
    getPreciosCanjes, 
    getLineas,
    getModelos,
    addPrecioCanje,
    deletePrecioCanje,
    editPrecioCanje
}