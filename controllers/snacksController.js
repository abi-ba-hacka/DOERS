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
		getSnacksByBarId: function(barId){
				return Snack.find({'pubId': barId}, function(err, snacks){
		              if (err) return console.error(err);
		              		return snacks;          
		        });
		},
		getAll: function(){
				return Snack.find(function(err, snacks) {
				  if (err)  console.error(err);
				  		return snacks;
				});
		}
}