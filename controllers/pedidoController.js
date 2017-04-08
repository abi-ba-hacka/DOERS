var Pedido = require('../daos/pedidoDao');
var request = require('request');
config = require('config');

module.exports = {
	insertPedido: function(pedido){
							console.log("llame a grabar pedido con : " + JSON.stringify(pedido));
							Pedido.insertPedido(pedido);
							console.log("Me traigo los pedidos con : " + JSON.stringify(pedido))
							Pedido.getPedidoActivoUser(pedido.userId, function(pedidoRes){
								console.log(pedidoRes);
							});
						},
}