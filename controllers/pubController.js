var Pub = require('../models/pubModel');

module.exports  =  {
		insertPub: function(newPub){
					    	var pub = new Pub({
							    id: newPub.id,                      
							    name: newPub.name,  
							    direction: newPub.direction,  
							    geoLatLang: newPub.geoLatLang,  
							    availableTime: newPub.availableTime,  
							    image: newPub.image, 
							    phone_number: newPub.phone_number
							  });

							  pub.save(function(err){
							    if ( err ) throw err;
							    console.log("Pub Saved Successfully");
							  });  
					},
		getPubById: function(pubId){
				return Pub.find({'id': pubId}, function(err, pub){
		              if (err) return console.error(err);
		              		return pub;          
		        });
		},
		getAll: function(){
				return Pub.find(function(err, pubs) {
				  if (err)  console.error(err);
				  		return pubs;
				});
		},
		updatePub: function(newPub){
			 Pub.findOne({'id': newPub.id}, function(err, pub){
		              if (err) return console.error(err);
		             	pub.geoLatLang = newPub.geoLatLang;
		             	Pub.save(function(err){
							    if ( err ) throw err;
							    console.log("Pub " +  type + " updated Successfully");
						}); 
		        });
		}
}