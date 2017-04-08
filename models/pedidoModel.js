var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Schema Query
//***********
var PedidoSchema = new Schema({
	pedidoId: { type: String },                      
    userId: { type: String},
    activo: { type: String}   
}, { collection : 'Pedido' })

var Pedido = mongoose.model('Pedido', PedidoSchema);


module.exports = Pedido;