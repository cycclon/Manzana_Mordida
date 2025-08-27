const Horario = require('../schemas/horario.model');

async function detectarSuperposicionSimple(req, res, next) {
    try {
        const { diaSemana, horaInicio, horaFinal } = req.body;
        
        const resultado = await detectarSuperposicion(diaSemana, horaInicio, horaFinal);
        if(!resultado) next(new Error('Horario superpuesto. Intente con otro día/horario.'));

        next();
    } catch (error) {
        next(error);
    }
}

async function detectarSuperposicion(diaSemana, horaInicio, horaFinal) {
    try {
        const horarios = await Horario.find({ diaSemana: diaSemana });
        let flag = true;

        console.log(diaSemana);

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
        const { diasSemana, horaInicio, horaFinal } = req.body;
        let flag = true;
        
        for (const ds of diasSemana) {
            const resultado = await detectarSuperposicion(ds, horaInicio, horaFinal);
            if (!resultado) {
                flag = false;
                break; // optional optimization
            }
        }

        console.log(flag);
        if(!flag) next(new Error('Horario superpuesto. Intente con otro día/horario.'));

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = { detectarSuperposicionSimple, detectarSuperposicionMultiple };