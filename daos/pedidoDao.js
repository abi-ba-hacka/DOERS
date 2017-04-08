var Pedido = require('../models/pedidoModel');

module.exports = {
	insertPedido: function(pedido){
							console.log("llame a grabar pedido con : " + JSON.stringify(pedido));
					    	var pedi = new Pedido({
							    pedidoId: pedido.userId,                      
							    userId: pedido.userId,
							    activo: "S"  
							  });

							  pedi.save(function(err){
							    if ( err ) throw err;
							    console.log("Pedido Saved Successfully");
							  });  
					},
	getPedidoActivoUser: function(userId, callback){
							console.log("llame a buscar pedidos con: " + JSON.stringify(userId));
							Pedido.findOne({'userId': userId, 'activo': "S"}, function(err, pedido){
					              if (err) return console.error(err);
					              callback(pedido);          
					        });
					},
}