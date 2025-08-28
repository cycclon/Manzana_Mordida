const Horario = require('../schemas/horario.model');

async function detectarSuperposicionSimple(req, res, next) {
    try {
        const { diaSemana, horaInicio, horaFinal, vendedor, sucursal } = req.body;
        
        const resultado = await detectarSuperposicion(diaSemana, horaInicio, horaFinal, vendedor, sucursal);
        if(!resultado) next(new Error('Horario superpuesto. Intente con otro día/horario.'));

        next();
    } catch (error) {
        next(error);
    }
}

async function detectarSuperposicion(diaSemana, horaInicio, horaFinal, vendedor, sucursal) {
    try {
        const horarios = await Horario.find({ diaSemana, vendedor, sucursal });
        let flag = true;

        horarios.map(h => {
            if(
                (horaInicio >= h.horaInicio && horaInicio < h.horaFinal) ||
                (horaFinal > h.horaInicio && horaInicio < h.horaInicio) ||
                (horaInicio === h.horaInicio && horaFinal === h.horaFinal)
            ) flag = false;
        });

        return flag
    } catch (error) {
        throw error;
    }
}

async function detectarSuperposicionMultiple(req, res, next) {
    try {
        const { diasSemana, horaInicio, horaFinal, vendedor, sucursal } = req.body;
        let flag = true;
        
        for (const ds of diasSemana) {
            const resultado = await detectarSuperposicion(ds, horaInicio, horaFinal, vendedor, sucursal);
            if (!resultado) {
                flag = false;
                break; // optional optimization
            }
        }

        if(!flag) next(new Error('Horario superpuesto. Intente con otro día/horario.'));

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = { detectarSuperposicionSimple, detectarSuperposicionMultiple };