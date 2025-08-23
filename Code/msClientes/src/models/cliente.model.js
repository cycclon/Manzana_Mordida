const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
   nombres: {
    type: String,
    required: true,
   },
   apellidos: {
    type: String,
    required: true,
   },
   email: {
    type: String,
    required: true
   },
   whatsapp: {
    type: String,
    required: false
   },
   usuario: {
      type: String,
      required: true
   }
});

module.exports = mongoose.model("cliente", clienteSchema);