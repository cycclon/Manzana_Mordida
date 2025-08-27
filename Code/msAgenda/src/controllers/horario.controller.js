const Horario = require('../schemas/horario.model');

async function addHorario(req, res, next) {
    try {
        const { diaSemana, sucursal, vendedor, horaInicio, horaFinal } = req.body;

        RegistrarHorario(diaSemana, sucursal, vendedor, horaInicio, horaFinal);

        res.status(200).json({ message: 'Horario registrado' });
    } catch (error) {
        next(error);
    }
}

async function RegistrarHorario(diaSemana, sucursal, vendedor, horaInicio, horaFinal) {
    try {
        const nuevoHorario = new Horario({
            vendedor,
            sucursal,
            diaSemana,
            horaInicio,
            horaFinal
        });

        await nuevoHorario.save();
    } catch (error) {
        throw error;
    }
}

// Agrega varios horarios en distintos días de la semana
async function addHorarios(req, res, next) {
    try {
        const {vendedor, sucursal, diasSemana, horaInicio, horaFinal} = req.body;

        diasSemana.map(async ds => {
            await RegistrarHorario(ds, sucursal, vendedor, horaInicio, horaFinal);
        });

        res.status(200).json({ message: 'Horarios registrados.' });
    } catch (error) {
        next(error);
    }
}

async function deleteHorario(req, res, next) {
    try {
        const { id } = req.params;
        const result = await Horario.deleteOne({_id: id});
        
        if(result.deletedCount === 0) return res.status(404).json({ message: 'Horario inexistente' });

        res.status(200).json({ message: 'Horario eliminado' });
    } catch (error) {
        next(error);
    }
}

module.exports = { addHorario, addHorarios, deleteHorario };