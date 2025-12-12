const app = require('./app');

const PORT = process.env.PORT || 3008;

app.listen(PORT,()=> {
    console.log(`Microservicio CRM corriendo en puerto ${PORT}`)
});