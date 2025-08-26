module.exports = (err, req, res, next) => {
    //console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = undefined;

    // Handle invalid ObjectId (CastError)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = 'ID inválida';
    }

    // Handle Mongoose validation errors
    if(err.name === 'ValidationError') {
        statusCode = 400
        message = 'Error de validación';
        errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
    }

    // Handle duplicate key error (e.g. unique username/email)
    if(err.code && err.code === 11000) {
        statusCode = 400;
        message = 'El valor del campo ingresado ya existe en la base de datos.';
        errors = Object.keys(err.keyValue).map(field => ({
            field,
            message: `${field} ya existe`
        }));
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }), // only include if validation errors exist
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};