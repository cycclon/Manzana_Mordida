const app = require('./app');

const PORT = process.env.PORT || 3007;

app.listen(PORT,()=> {
    console.log(`Microservicio Reservas corriendo en puerto ${PORT}`)
});