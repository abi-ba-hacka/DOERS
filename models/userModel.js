var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Schema Query
//***********
var UserSchema = new Schema({
	id: { type: String },                      
    nombre: { type: String},
    apellido: { type: String},
    fotoPerfil: { type: String},
    genero: { type: String},
    zona: { type: String},
    type: { type: String},
 	fechaAlta: { type: Date }      
}, { collection : 'Usuarios' })

var User = mongoose.model('User', UserSchema);


module.exports = User;