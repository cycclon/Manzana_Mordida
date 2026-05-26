const Equipo = require('../schemas/EquipoSchema');
const { getCachedColorMap } = require('../utils/ColorCache');
const { getProductoByName } = require('../utils/ProductoUtils');
const mongoose = require('mongoose');
const { uploadImage, deleteImage } = require('../utils/R2Client');

// Producto populate
const prodPopulate = [
                        { path: 'producto', select: 'marca linea modelo' },
                        { path: 'color', select: 'nombre hex' }
                    ];

// OBTENER TODOS LOS EQUIPOS
exports.getEquipos = async (req, res, next) => {
    try {
        // Build filter query from request params
        const filter = {};

        // Filter by condition (condicion)
        if (req.query.condicion) {
            filter.condicion = req.query.condicion;
        }

        // Filter by estado (status)
        if (req.query.estado) {
            filter.estado = req.query.estado;
        }

        // Filter by grade (grado)
        if (req.query.grado) {
            filter.grado = req.query.grado;
        }

        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            filter.precio = {};
            if (req.query.minPrice) {
                filter.precio.$gte = parseFloat(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                filter.precio.$lte = parseFloat(req.query.maxPrice);
            }
        }

        // Filter by battery health (condicionBateria)
        // Sealed devices (condicion: "Sellado") are assumed to have 100% battery
        if (req.query.minBatteryHealth) {
            const minBattery = parseFloat(req.query.minBatteryHealth) / 100;
            filter.$or = [
                { condicionBateria: { $gte: minBattery } },
                // Include sealed devices when filtering (they're assumed 100% battery)
                { condicion: 'Sellado', condicionBateria: { $exists: false } },
                { condicion: 'Sellado', condicionBateria: null }
            ];
        }

        // Filter by canjeable (tradeable)
        if (req.query.canjeable !== undefined) {
            filter.canjeable = req.query.canjeable === 'true';
        }

        // Obtener equipos con filtros y completar campo producto y campo color (referencias)
        const equipos = await Equipo.find(filter).populate(prodPopulate);

        // If search query is provided, filter by producto model/marca/linea after populate
        let filteredEquipos = equipos;
        if (req.query.search) {
            const searchLower = req.query.search.toLowerCase();
            filteredEquipos = equipos.filter(equipo => {
                const producto = equipo.producto;
                return (
                    producto.modelo?.toLowerCase().includes(searchLower) ||
                    producto.marca?.toLowerCase().includes(searchLower) ||
                    producto.linea?.toLowerCase().includes(searchLower)
                );
            });
        }

        res.status(200).json(filteredEquipos);
    } catch (error) {
        next(error);
    }
};

// OBTENER EQUIPO POR ID
exports.getEquipoID = async (req, res, next) => {
    try {
        // Obtener equipo y completar campo producto y campo color (referencias)
        const equipo = await Equipo.findOne({ _id: req.params.id }).populate(prodPopulate);

        // Si se encuentra algún equipo, se devuelve, sino se envía un mensaje de error 404
        if(!equipo) {
            res.status(404).json({message: 'Equipo no encontrado'});
            return
        } else {
            res.status(200).json(equipo);
            return
        }
    } catch (error) {
       next(error);
    }
}

// Registrar nuevo equipo
exports.addEquipo = async (req, res, next) => {
    try {
        const {producto, condicionBateria, condicion, grado, estado, costo, precio, detalles, accesorios, color, garantiaApple, garantiaPropia, ubicacion, canjeable, fechaVenta, equipoCanjeOrigen} = req.body;

        // Obtener producto por nombre
        const p = await getProductoByName(producto);
        // Verificar que el producto exista, sino disparar un error
        if(!p) throw new Error('Producto inexistente');

        // Obtener colores en cache
        const cachedColors = await getCachedColorMap();
        const idColor = cachedColors.get(color);
        //Verificar que el color exista, sino disparar un error
        if(!idColor) throw new Error('Color inexistente');

        const nuevoEquipo = new Equipo({
            producto: p._id,
            condicionBateria,
            condicion,
            grado,
            estado,
            costo,
            precio,
            detalles,
            accesorios,
            color: idColor,
            garantiaApple,
            garantiaPropia,
            ubicacion,
            canjeable,
            // Vínculo de canje opcional: la venta de qué equipo trajo a este como trade-in
            ...(equipoCanjeOrigen ? { equipoCanjeOrigen } : {})
        });

        // Set fechaVenta if status is "Vendido"
        if (estado === 'Vendido') {
            if (fechaVenta && fechaVenta.trim() !== '') {
                nuevoEquipo.fechaVenta = new Date(fechaVenta);
            } else {
                nuevoEquipo.fechaVenta = new Date();
            }
        }

        // console.log(nuevoEquipo);
        await nuevoEquipo.save();
        res.status(201).json({message: 'Equipo registrado'});
    } catch (error) {
        next(error);
    }
};

exports.editEquipo = async (req, res, next) => {
    //console.log('edit equipo');
    try {
        const equipoEditado = await Equipo.findOne({_id: req.params.id});
        const { condicionBateria, grado, estado, costo, precio, detalles, accesorios, garantiaApple, garantiaPropia, ubicacion, canjeable, fechaVenta, equipoCanjeOrigen} = req.body;

        // Verificar si cada variable del cuerpo tiene algun valor, si lo tiene, establecerla
        equipoEditado.condicionBateria = condicionBateria || equipoEditado.condicionBateria;
        equipoEditado.grado = grado || equipoEditado.grado;

        // Handle estado changes and fechaVenta logic
        const oldEstado = equipoEditado.estado;
        const newEstado = estado || equipoEditado.estado;
        equipoEditado.estado = newEstado;

        // Auto-manage fechaVenta based on estado
        if (newEstado === 'Vendido') {
            // If changing to Vendido, set fechaVenta (use provided or current date)
            if (fechaVenta !== undefined) {
                // Manual date provided
                equipoEditado.fechaVenta = fechaVenta ? new Date(fechaVenta) : new Date();
            } else if (oldEstado !== 'Vendido') {
                // Auto-set to current date when first changing to Vendido
                equipoEditado.fechaVenta = new Date();
            }
            // If already Vendido and no fechaVenta provided, keep existing
        } else {
            // If changing from Vendido to something else, clear fechaVenta
            equipoEditado.fechaVenta = undefined;
        }

        equipoEditado.costo = costo || equipoEditado.costo;
        equipoEditado.precio = precio || equipoEditado.precio;
        equipoEditado.detalles = detalles || equipoEditado.detalles;
        equipoEditado.accesorios = accesorios || equipoEditado.accesorios;
        equipoEditado.garantiaApple = garantiaApple || equipoEditado.garantiaApple;
        equipoEditado.garantiaPropia = garantiaPropia || equipoEditado.garantiaPropia;
        equipoEditado.ubicacion = ubicacion || equipoEditado.ubicacion;
        equipoEditado.canjeable = canjeable || equipoEditado.canjeable;

        // Vínculo de canje: permitir asignar o limpiar (string vacío / null => limpiar)
        if (equipoCanjeOrigen !== undefined) {
            equipoEditado.equipoCanjeOrigen = equipoCanjeOrigen || undefined;
        }

        await equipoEditado.save();

        res.status(201).json({message: "Equipo editado."})
    } catch (error) {
        next(error);
    }
};

exports.deleteEquipo = async (req, res, next) => {
    try {
        await Equipo.deleteOne({ _id: req.params.id });
        res.status(201).json({message: "Equipo eliminado."})
    } catch (error) {
        next(error);
    }
};

exports.uploadImagenes = async (req, res, next) => {
    try {
        const equipo = await Equipo.findById(req.params.id);
        
        if(!equipo) {
            return res.status(404).json({ message: 'Equipo no encontrado'});
        }

        // Check total images (existing + new)
        const currentCount = equipo.imagenes?.length || 0;
        const newCount = req.files.length;

        if(currentCount + newCount > 5) {
            return res.status(400).json({
                message: `Máximo 5 imágenes permitidas. Actualmente: ${currentCount}, intentando agregar ${newCount}`
            });
        }

        // Upload images to R2
        const uploadPromises = req.files.map(file => uploadImage(file));
        const imageUrls = await Promise.all(uploadPromises);

        // Add URLs to equipo
        equipo.imagenes = [...(equipo.imagenes || []), ...imageUrls];
        await equipo.save();

        // Propagar imágenes a hermanos sellados idénticos (mismo producto y color)
        // que aún no tienen fotos: comparten la MISMA URL → un solo archivo en el CDN.
        let propagadas = 0;
        if (equipo.condicion === 'Sellado' && equipo.imagenes.length > 0) {
            const result = await Equipo.updateMany(
                {
                    _id: { $ne: equipo._id },
                    producto: equipo.producto,
                    color: equipo.color,
                    condicion: 'Sellado',
                    $or: [
                        { imagenes: { $exists: false } },
                        { imagenes: { $size: 0 } },
                        { imagenes: null }
                    ]
                },
                { $set: { imagenes: equipo.imagenes } }
            );
            propagadas = result.modifiedCount;
        }

        res.json({
            message: 'Imágenes subidas exitosamente',
            propagadas
        });        
    } catch (error) {
        next(error);
    }
};

exports.deleteImagen = async (req, res, next) => {
    try {
        const { imageUrl } = req.body;

        if(!imageUrl) {
            return res.status(400).json({message: 'imageUrl requerido'});
        }

        const equipo = await Equipo.findById(req.params.id);

        if(!equipo) {
            return res.status(404).json({message: 'Equipo no encontrado'});
        }

        // remove from R2 sólo si ningún OTRO equipo todavía referencia este archivo
        // (equipos sellados idénticos comparten la misma URL; no orfanar a los hermanos)
        const refCount = await Equipo.countDocuments({ _id: { $ne: equipo._id }, imagenes: imageUrl });
        if (refCount === 0) {
            await deleteImage(imageUrl);
        }

        // Remove from database
        equipo.imagenes = equipo.imagenes.filter(img => img !== imageUrl);
        await equipo.save();

        return res.json({
            message: 'Imagen eliminada exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

// Get all unique details from devices (for autocomplete)
exports.getAllDetalles = async (req, res, next) => {
    try {
        // Get all unique details from all equipos
        const detalles = await Equipo.distinct('detalles');

        // Filter out empty strings and sort alphabetically
        const filteredDetalles = detalles
            .filter(detalle => detalle && detalle.trim() !== '')
            .sort((a, b) => a.localeCompare(b));

        res.status(200).json(filteredDetalles);
    } catch (error) {
        next(error);
    }
};

// ============================================================================
// FLUJO DE CANJES (trade-in profit chain)
// ============================================================================
// Una "cadena" arranca en un equipo comprado a un proveedor (RAÍZ, sin
// equipoCanjeOrigen) y se ramifica por los canjes: al vender un equipo se puede
// recibir otro como parte de pago; ese equipo hijo apunta al padre vía
// equipoCanjeOrigen. La cadena se "cierra" cuando todos sus equipos están
// Vendidos. Ganancia por nodo = precio - costo; el "crédito de canje" de una
// arista padre->hijo es el costo del hijo (lo que se acreditó al cliente).

const MAX_CHAIN_DEPTH = 200; // guarda anti-ciclos / inventarios grandes

// Carga todo el inventario una sola vez y arma índices en memoria
// (mismo orden de magnitud que getEquipos; endpoint sólo admin/sales).
async function loadEquipoGraph() {
    const all = await Equipo.find({}).populate(prodPopulate);
    const byId = new Map();
    const childrenByParent = new Map();
    for (const e of all) {
        byId.set(String(e._id), e);
    }
    for (const e of all) {
        const pid = e.equipoCanjeOrigen ? String(e.equipoCanjeOrigen) : null;
        if (pid && byId.has(pid)) {
            if (!childrenByParent.has(pid)) childrenByParent.set(pid, []);
            childrenByParent.get(pid).push(e);
        }
    }
    return { all, byId, childrenByParent };
}

// Sube por equipoCanjeOrigen hasta la raíz (equipo de proveedor)
function findRootId(equipoId, byId) {
    let current = byId.get(String(equipoId));
    if (!current) return null;
    const visited = new Set([String(current._id)]);
    while (current.equipoCanjeOrigen) {
        const pid = String(current.equipoCanjeOrigen);
        const parent = byId.get(pid);
        if (!parent || visited.has(pid)) break; // sin padre cargado o ciclo
        visited.add(pid);
        current = parent;
    }
    return String(current._id);
}

// BFS desde la raíz -> nodos + aristas + resumen
function buildChain(rootId, byId, childrenByParent) {
    const nodes = [];
    const edges = [];
    const visited = new Set();
    const depthCount = {};
    const queue = [{ id: String(rootId), depth: 0, acquisition: 'provider' }];

    while (queue.length && nodes.length < MAX_CHAIN_DEPTH) {
        const { id, depth, acquisition } = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);
        const equipo = byId.get(id);
        if (!equipo) continue;

        const costo = equipo.costo ?? 0;
        const precio = equipo.precio ?? 0;
        const sold = equipo.estado === 'Vendido';
        const xIndex = depthCount[depth] || 0;
        depthCount[depth] = xIndex + 1;

        nodes.push({
            equipoId: id,
            equipo,                 // device populado (producto, color, ...)
            acquisition,            // 'provider' | 'trade-in'
            sold,
            estado: equipo.estado,
            fechaVenta: equipo.fechaVenta || null,
            costo,
            precio,
            profit: precio - costo,
            depth,
            xIndex,
        });

        const children = childrenByParent.get(id) || [];
        for (const child of children) {
            edges.push({ from: id, to: String(child._id), tradeInCredit: child.costo ?? 0 });
            queue.push({ id: String(child._id), depth: depth + 1, acquisition: 'trade-in' });
        }
    }

    const invested = nodes[0]?.costo ?? 0;
    const realizedProfit = nodes.filter(n => n.sold).reduce((s, n) => s + n.profit, 0);
    const projectedProfit = nodes.reduce((s, n) => s + n.profit, 0);
    // Cerrada: todos los equipos de la cadena están vendidos (ciclo completo).
    // Abierta: queda al menos uno en stock (la cadena sigue su curso).
    const allSold = nodes.length > 0 && nodes.every(n => n.sold);

    return {
        rootEquipoId: String(rootId),
        nodes,
        edges,
        summary: {
            invested,
            realizedProfit,
            projectedProfit,
            roi: invested > 0 ? realizedProfit / invested : null,
            deviceCount: nodes.length,
            status: allSold ? 'closed' : 'open',
        },
    };
}

// Flujo de la cadena que contiene un equipo dado
// GET /api/equipos/flujo/:id
exports.getFlujo = async (req, res, next) => {
    try {
        const { byId, childrenByParent } = await loadEquipoGraph();
        if (!byId.has(String(req.params.id))) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }
        const rootId = findRootId(req.params.id, byId);
        const flujo = buildChain(rootId, byId, childrenByParent);
        res.status(200).json({ success: true, data: flujo });
    } catch (error) {
        next(error);
    }
};

// Listado de cadenas (raíces de proveedor con canjes o ya vendidas) + resumen
// GET /api/equipos/flujos?sort=profit|roi&page=1&limit=100
exports.getFlujos = async (req, res, next) => {
    try {
        const { sort = 'profit', page = 1, limit = 100 } = req.query;
        const { all, byId, childrenByParent } = await loadEquipoGraph();

        // Raíces = equipos de proveedor (sin equipoCanjeOrigen)
        const rootDocs = all.filter(e => !e.equipoCanjeOrigen);
        let chains = rootDocs.map(r => buildChain(String(r._id), byId, childrenByParent));

        // Sólo cadenas con al menos un canje (más de un equipo). Una venta de un
        // solo nivel (equipo comprado y vendido sin canje) no es una "cadena" y
        // satura el listado, así que se omite.
        chains = chains.filter(ch => ch.nodes.length > 1);

        chains.sort((a, b) => {
            if (sort === 'roi') {
                return (b.summary.roi ?? -Infinity) - (a.summary.roi ?? -Infinity);
            }
            return b.summary.realizedProfit - a.summary.realizedProfit;
        });

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const total = chains.length;
        const start = (pageNum - 1) * limitNum;
        const paged = chains.slice(start, start + limitNum);

        const data = paged.map(ch => ({
            rootEquipoId: ch.rootEquipoId,
            rootEquipo: ch.nodes[0]?.equipo || null,
            summary: ch.summary,
        }));

        res.status(200).json({
            success: true,
            data,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        next(error);
    }
};