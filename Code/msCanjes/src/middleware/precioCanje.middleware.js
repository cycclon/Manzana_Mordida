const precioCanje = require('../schemas/precioCanje.schema');

const MENSAJE_ERROR = 'Porcentaje de batería superpuesto. Intente con otro rango mínimo/máximo.';

async function detectarSuperposicionSimple(req, res, next) {
    try {
        const { linea, modelo, bateriaMin, bateriaMax } = req.body;
        
        const resultado = await detectarSuperposicion(linea, modelo, bateriaMin, bateriaMax);
        if(!resultado) next(new Error(MENSAJE_ERROR));

        next();
    } catch (error) {
        next(error);
    }
}

async function detectarSuperposicion(linea, modelo, bateriaMin, bateriaMax) {
    try {
        const precios = await precioCanje.find({ linea, modelo });
        let flag = true;

        precios.map(p => {
            if(
                (bateriaMin >= p.bateriaMin && bateriaMin < p.bateriaMax) ||
                (bateriaMax > p.bateriaMin && bateriaMin < p.bateriaMin) ||
                (bateriaMin === p.bateriaMin && bateriaMax === p.bateriaMax)
            ) flag = false;
        });

        return flag
    } catch (error) {
        throw error;
    }
}

// async function detectarSuperposicionMultiple(req, res, next) {
//     try {
//         const { diasSemana, horaInicio, horaFinal, vendedor, sucursal } = req.body;
//         let flag = true;
        
//         for (const ds of diasSemana) {
//             const resultado = await detectarSuperposicion(ds, horaInicio, horaFinal, vendedor, sucursal);
//             if (!resultado) {
//                 flag = false;
//                 break; // optional optimization
//             }
//         }

//         if(!flag) next(new Error(MENSAJE_ERROR));

//         next();
//     } catch (error) {
//         next(error);
//     }
// }

module.exports = { detectarSuperposicionSimple };