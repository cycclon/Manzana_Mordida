const app = require('./app');

const PORT = process.env.PORT || 3003;

app.listen(PORT,()=> {
    console.log(`Microservicio Sucursales corriendo en puerto ${PORT}`)
});