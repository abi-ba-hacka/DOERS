var ItemPedido = require('../models/pedidoItemModel');

module.exports = {
		insertarItemPedido: function(pedido){
							console.log("llame a grabar pedido con : " + JSON.stringify(pedido));
					    	var pedi = new ItemPedido({
							    pedidoId: pedido.userId,                      
							    userId: pedido.userId,
							    variedad: pedido.variedad 
							  });

							  pedi.save(function(err){
							    if ( err ) throw err;
							    console.log("Pedido Saved Successfully");
							  });  
					},
}