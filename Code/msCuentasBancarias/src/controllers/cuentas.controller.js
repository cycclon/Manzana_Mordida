const Cuenta = require('../schemas/cuenta.model');

async function addCuenta(req, res, next) {
    try {
        const { entidad, cbu, alias, titular, monedas } = req.body;
        const cuenta = new Cuenta({
            entidad,
            cbu,
            alias,
            titular,
            monedas
        });

        await cuenta.save();

        res.status(201).json({ message: 'Cuenta registrada correctamente'});
    } catch (error) {
        next(error);
    }
};

async function deleteCuenta(req, res, next) {
    try {
        const { id } = req.params;
        const result = await Cuenta.deleteOne({_id: id});

        if(result.deletedCount === 0) return res.status(404).json({ message: 'Cuenta inexistente'});

        res.status(201).json({ message: "Cuenta Elimninada."});
    } catch (error) {
        next(error);
    }
};

async function editCuenta(req, res, next) {
    try {
        const { id } = req.params;
        const { alias, monedas } = req.body;

        const cuenta = await Cuenta.findById(id);
        if(!cuenta) return res.status(404).json({ message: 'Cuenta inexistente'});

        cuenta.alias = alias ? alias : cuenta.alias;
        cuenta.monedas = monedas ? monedas : cuenta.monedas;
        
        await cuenta.save();

        res.status(201).json({ message: 'Cuenta editada correctamente.'});
    } catch (error) {
        next(error);
    }
};

async function getCuentas(req, res, next) {
    try {
        const cuentas = await Cuenta.find({});

        res.status(200).json(cuentas);
    } catch (error) {
        next(error);
    }
};

module.exports = { addCuenta, getCuentas, deleteCuenta, editCuenta };