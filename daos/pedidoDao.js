var Pedido = require('../models/pedidoModel');
var request = require('request');
config = require('config');

module.exports = {
	insertPedido: function(pedido){
							console.log("llame a grabar pedido con : " + JSON.stringify(pedido));
					    	var pedido = new Pedido({
							    id: pedido.userId,                      
							    userId: pedido.userId,
							    activo: "S"  
							  });

							  pedido.save(function(err){
							    if ( err ) throw err;
							    console.log("User Saved Successfully");
							  });  
					},
}