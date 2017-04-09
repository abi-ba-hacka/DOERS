var Snack = require('../models/snacksModel');

module.exports  =  {
		insertSnack: function(newSnack){
					    	var snack = new Snack({
							    id: newSnack.id ,                      
							    pubId: newSnack.barId,
							    name: newSnack.name,
							    description: newSnack.description,
							    price: newSnack.price,
							    image: newSnack.image  
							  });

							  snack.save(function(err){
							    if ( err ) throw err;
							    console.log("Snack Saved Successfully");
							  });  
					},
		getSnackById: function(snackId){
				return Snack.findOne({'id': snackId}, function(err, snack){
		              if (err) return console.error(err);
		              		return snack;          
		        });
		},
		getAll: function(){
				return Pub.find(function(err, snack) {
				  if (err)  console.error(err);
				  		return snack;
				});
		}
}