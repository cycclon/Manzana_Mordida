const CRM = require('../schemas/crm.model');
const { CRM_ESTADOS, REDES_SOCIALES } = require('../schemas/crm.model');

/**
 * Create a new CRM record
 */
async function addCRM(req, res, next) {
    try {
        const {
            usuario,
            redSocial,
            idRedSocial,
            nombres,
            apellidos,
            telefono,
            email,
            intereses,
            notas
        } = req.body;

        // Validate required fields
        if (!usuario || !redSocial) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y red social son requeridos'
            });
        }

        // Check if CRM already exists for this user/network combination
        const existingCRM = await CRM.findOne({ usuario, redSocial });
        if (existingCRM) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un CRM para este usuario en esta red social',
                existingCRM
            });
        }

        const nuevoCRM = new CRM({
            usuario,
            redSocial,
            idRedSocial,
            nombres,
            apellidos,
            telefono,
            email,
            estado: 'Nuevo lead',
            historialEstados: [{
                estado: 'Nuevo lead',
                fecha: new Date(),
                notas: 'Registro inicial'
            }],
            intereses,
            notas,
            requiereHumano: false,
            fechaUltimoContacto: new Date()
        });

        await nuevoCRM.save();

        res.status(201).json({
            success: true,
            message: 'CRM creado exitosamente',
            data: nuevoCRM
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Edit CRM record
 */
async function editCRM(req, res, next) {
    try {
        const { idcrm } = req.params;
        const updateData = req.body;

        // If crm was modified by middleware (status change), use that
        if (req.crm) {
            await req.crm.save();
            return res.status(200).json({
                success: true,
                message: 'CRM actualizado exitosamente',
                data: req.crm
            });
        }

        // Regular edit - remove fields that shouldn't be directly edited
        delete updateData.estado; // Use cambiarEstado endpoint for status changes
        delete updateData.historialEstados;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // Update fechaUltimoContacto if not provided
        if (!updateData.fechaUltimoContacto) {
            updateData.fechaUltimoContacto = new Date();
        }

        const crm = await CRM.findByIdAndUpdate(
            idcrm,
            updateData,
            { new: true, runValidators: true }
        );

        if (!crm) {
            return res.status(404).json({
                success: false,
                message: 'CRM no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'CRM actualizado exitosamente',
            data: crm
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Change CRM status
 */
async function cambiarEstado(req, res, next) {
    try {
        const { idcrm, nuevoestado } = req.params;
        const { notas } = req.body;

        const crm = await CRM.findById(idcrm);
        if (!crm) {
            return res.status(404).json({
                success: false,
                message: 'CRM no encontrado'
            });
        }

        // Validate new status
        if (!CRM_ESTADOS.includes(nuevoestado)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Estados válidos: ${CRM_ESTADOS.join(', ')}`
            });
        }

        // Define valid state transitions
        const transicionesValidas = {
            'Nuevo lead': ['Interesado', 'En evaluación', 'Negociación/Cierre', 'Venta concretada/Postventa', 'Lead frío', 'Perdido'],
            'Interesado': ['En evaluación', 'Negociación/Cierre', 'Venta concretada/Postventa', 'Lead frío', 'Perdido'],
            'En evaluación': ['Interesado', 'Negociación/Cierre', 'Venta concretada/Postventa', 'Lead frío', 'Perdido'],
            'Negociación/Cierre': ['Venta concretada/Postventa', 'Lead frío', 'Perdido'],
            'Venta concretada/Postventa': [], // Final state
            'Lead frío': ['Interesado', 'En evaluación', 'Negociación/Cierre', 'Venta concretada/Postventa', 'Perdido'],
            'Perdido': [] // Final state
        };

        const estadoActual = crm.estado;

        // Check if transition is valid
        if (!transicionesValidas[estadoActual].includes(nuevoestado)) {
            return res.status(400).json({
                success: false,
                message: `No se puede cambiar el estado de '${estadoActual}' a '${nuevoestado}'`,
                transicionesPermitidas: transicionesValidas[estadoActual]
            });
        }

        // Update status and add to history
        crm.estado = nuevoestado;
        crm.historialEstados.push({
            estado: nuevoestado,
            fecha: new Date(),
            notas: notas || `Cambio de estado: ${estadoActual} → ${nuevoestado}`
        });
        crm.fechaUltimoContacto = new Date();

        await crm.save();

        res.status(200).json({
            success: true,
            message: 'Estado actualizado exitosamente',
            data: crm
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Bulk update status for multiple CRMs
 */
async function cambiarEstadoMultiple(req, res, next) {
    try {
        const { ids, nuevoEstado, notas } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de IDs'
            });
        }

        if (!CRM_ESTADOS.includes(nuevoEstado)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Estados válidos: ${CRM_ESTADOS.join(', ')}`
            });
        }

        const results = {
            success: [],
            failed: []
        };

        for (const id of ids) {
            try {
                const crm = await CRM.findById(id);
                if (!crm) {
                    results.failed.push({ id, reason: 'No encontrado' });
                    continue;
                }

                crm.estado = nuevoEstado;
                crm.historialEstados.push({
                    estado: nuevoEstado,
                    fecha: new Date(),
                    notas: notas || `Cambio masivo de estado a ${nuevoEstado}`
                });
                crm.fechaUltimoContacto = new Date();
                await crm.save();
                results.success.push(id);
            } catch (err) {
                results.failed.push({ id, reason: err.message });
            }
        }

        res.status(200).json({
            success: true,
            message: `${results.success.length} actualizados, ${results.failed.length} fallidos`,
            data: results
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Toggle requiereHumano flag
 */
async function toggleRequiereHumano(req, res, next) {
    try {
        const { idcrm } = req.params;
        const { requiereHumano } = req.body;

        const crm = await CRM.findById(idcrm);
        if (!crm) {
            return res.status(404).json({
                success: false,
                message: 'CRM no encontrado'
            });
        }

        crm.requiereHumano = requiereHumano !== undefined ? requiereHumano : !crm.requiereHumano;
        await crm.save();

        res.status(200).json({
            success: true,
            message: `Bandera "requiere humano" ${crm.requiereHumano ? 'activada' : 'desactivada'}`,
            data: crm
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get CRM by username (partial match)
 */
async function getCRMCliente(req, res, next) {
    try {
        const { usuario } = req.params;

        const crms = await CRM.find({
            usuario: { $regex: usuario, $options: 'i' }
        }).sort({ fechaUltimoContacto: -1 });

        res.status(200).json({
            success: true,
            count: crms.length,
            data: crms
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get CRMs by status
 */
async function getCRMEstado(req, res, next) {
    try {
        const { estado } = req.params;

        const crms = await CRM.find({ estado })
            .sort({ fechaUltimoContacto: -1 });

        res.status(200).json({
            success: true,
            count: crms.length,
            data: crms
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get CRM by ID
 */
async function getCRMId(req, res, next) {
    try {
        const { idcrm } = req.params;

        const crm = await CRM.findById(idcrm);

        if (!crm) {
            return res.status(404).json({
                success: false,
                message: 'CRM no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: crm
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get all CRMs with filtering, sorting, and pagination
 */
async function getAllCRMs(req, res, next) {
    try {
        const {
            estado,
            redSocial,
            requiereHumano,
            usuario,
            fechaDesde,
            fechaHasta,
            sortBy = 'fechaUltimoContacto',
            sortOrder = 'desc',
            page = 1,
            limit = 50
        } = req.query;

        // Build filter query
        const filter = {};

        if (estado) {
            filter.estado = estado;
        }
        if (redSocial) {
            filter.redSocial = redSocial;
        }
        if (requiereHumano !== undefined) {
            filter.requiereHumano = requiereHumano === 'true';
        }
        if (usuario) {
            filter.usuario = { $regex: usuario, $options: 'i' };
        }
        if (fechaDesde || fechaHasta) {
            filter.fechaUltimoContacto = {};
            if (fechaDesde) {
                filter.fechaUltimoContacto.$gte = new Date(fechaDesde);
            }
            if (fechaHasta) {
                filter.fechaUltimoContacto.$lte = new Date(fechaHasta);
            }
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [crms, total] = await Promise.all([
            CRM.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            CRM.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            count: crms.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            data: crms
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get CRM statistics
 */
async function getEstadisticas(req, res, next) {
    try {
        const { fechaDesde, fechaHasta } = req.query;

        const matchStage = {};
        if (fechaDesde || fechaHasta) {
            matchStage.createdAt = {};
            if (fechaDesde) matchStage.createdAt.$gte = new Date(fechaDesde);
            if (fechaHasta) matchStage.createdAt.$lte = new Date(fechaHasta);
        }

        const [
            porEstado,
            porRedSocial,
            requiereHumanoCount,
            totalCount,
            recentActivity
        ] = await Promise.all([
            // Count by status
            CRM.aggregate([
                { $match: matchStage },
                { $group: { _id: '$estado', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            // Count by social network
            CRM.aggregate([
                { $match: matchStage },
                { $group: { _id: '$redSocial', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            // Count requiring human attention
            CRM.countDocuments({ ...matchStage, requiereHumano: true }),
            // Total count
            CRM.countDocuments(matchStage),
            // Recent activity (last 30 days by day)
            CRM.aggregate([
                {
                    $match: {
                        fechaUltimoContacto: {
                            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$fechaUltimoContacto' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        // Calculate conversion rate (leads that became sales)
        const ventasConcretadas = porEstado.find(e => e._id === 'Venta concretada/Postventa')?.count || 0;
        const tasaConversion = totalCount > 0 ? ((ventasConcretadas / totalCount) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                total: totalCount,
                requiereHumano: requiereHumanoCount,
                tasaConversion: `${tasaConversion}%`,
                porEstado: porEstado.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                porRedSocial: porRedSocial.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                actividadReciente: recentActivity
            }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get available states and social networks (for dropdowns)
 */
async function getOpciones(req, res, next) {
    try {
        res.status(200).json({
            success: true,
            data: {
                estados: CRM_ESTADOS,
                redesSociales: REDES_SOCIALES
            }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Delete CRM
 */
async function deleteCRM(req, res, next) {
    try {
        const { idcrm } = req.params;

        const crm = await CRM.findByIdAndDelete(idcrm);

        if (!crm) {
            return res.status(404).json({
                success: false,
                message: 'CRM no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'CRM eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    addCRM,
    editCRM,
    cambiarEstado,
    cambiarEstadoMultiple,
    toggleRequiereHumano,
    getCRMCliente,
    getCRMEstado,
    getCRMId,
    getAllCRMs,
    getEstadisticas,
    getOpciones,
    deleteCRM
};
