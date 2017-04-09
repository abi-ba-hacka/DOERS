var Beer = require('../models/beerModel');

module.exports = {
	getBeerPerLocal: function(localId, callback){
							console.log("llame a buscar beers con: " + JSON.stringify(localId));
							Beer.findOne({'pubId': localId}, function(err, beer){
					              if (err) return console.error(err);
					              callback(beer);          
					        });
					},
}