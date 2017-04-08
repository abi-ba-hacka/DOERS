var ItemPedido = require('../models/pedidoItemModel');

module.exports = {
		insertarItemPedido: function(pedido){
							console.log("llame a grabar el item de pedido con : " + JSON.stringify(pedido));
					    	var pedi = new ItemPedido({
							    pedidoId: pedido.userId,                      
							    userId: pedido.userId,
							    variedad: pedido.variedad,
							    precio: pedido.precio 
							  });

							  pedi.save(function(err){
							    if ( err ) throw err;
							    console.log("Item de Pedido Saved Successfully");
							  });  
					},
		getItemPedido: function(userId, callback){
			console.log("voy a buscar los pedidos");
				ItemPedido.find({'userId': userId}, function(err, pedidos){
		              if (err) return console.error(err);
		              callback(pedidos);          
		        });
		},
}