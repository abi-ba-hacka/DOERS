var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Schema Query
//***********
var ItemPedidoSchema = new Schema({
	pedidoId: { type: String },                      
    userId: { type: String},
    variedad: { type: String},
    precio: { type: String}   
}, { collection : 'PedidosItems' })

var ItemPedido = mongoose.model('ItemPedido', ItemPedidoSchema);


module.exports = ItemPedido;