var Pedido = require('../daos/pedidoDao');
var request = require('request');
config = require('config');

module.exports = {
	insertPedido: function(pedidoId){
							
							console.log("Me traigo los pedidos con : " + JSON.stringify(pedidoId))
							Pedido.getPedidoActivoUser(pedidoId.userId, function(pedido){
								if(pedido) {
									console.log("Encontre los siguientes pedidos")
									console.log(pedido);	
								}
								else {
									console.log("como no encontre el pedido, lo grabo");
									Pedido.insertPedido(pedidoId);
								}

								return pedidoId;
							});

						},
}