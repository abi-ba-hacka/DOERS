var Mercha = require('../models/merchandisingModel');

module.exports  =  {
		insertMercha: function(newMercha){
					    	var mercha = new Mercha({
							    id: newMercha.id ,                      
							    pubId: newMercha.barId,
							    name: newMercha.name,
							    description: newMercha.description,
							    price: newMercha.price,
							    image: newMercha.image  
							  });

							  mercha.save(function(err){
							    if ( err ) throw err;
							    console.log("Snack Saved Successfully");
							  });  
					},
		getMerchaByBarId: function(barId, callback){
				 Mercha.find({'pubId': barId}, function(err, merchas){
		              if (err) return console.error(err);
		              		callback(merchas);          
		        });
		},
		getAll: function(){
				return Mercha.find(function(err, Merchas) {
				  if (err)  console.error(err);
				  		return Merchas;
				});
		}
}