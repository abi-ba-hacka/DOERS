var Pedido = require('../models/pedidoModel');
var request = require('request');
config = require('config');

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
}