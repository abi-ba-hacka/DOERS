var Pedido = require('../daos/pedidoDao');
var request = require('request');
config = require('config');

module.exports = {
	insertPedido: function(pedidoId){
							console.log("llame a grabar pedido con : " + JSON.stringify(pedidoId));
							Pedido.insertPedido(pedidoId);
							console.log("Me traigo los pedidos con : " + JSON.stringify(pedidoId))
							Pedido.getPedidoActivoUser(pedidoId.userId, function(pedido){
								if(pedido) {
									console.log(pedido);	
								}
								else {}
							});
						},
}