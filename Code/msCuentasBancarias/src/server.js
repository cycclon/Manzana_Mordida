const app = require('./app');

const PORT = process.env.PORT || 3009;

app.listen(PORT,()=> {
    console.log(`Microservicio Cuentas Bancarias corriendo en puerto ${PORT}`)
});