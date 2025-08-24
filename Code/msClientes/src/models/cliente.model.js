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
   email: { // EDITABLE
    type: String,
    required: true
   },
   whatsapp: { // EDITABLE
    type: String,
    required: false
   },
   usuario: {
      type: String,
      required: true
   }
});

module.exports = mongoose.model("cliente", clienteSchema);