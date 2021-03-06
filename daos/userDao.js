var User = require('../models/userModel');
var request = require('request');
config = require('config');

module.exports  =  {
		insertUser: function(usuario){
					    	var user = new User({
							    id: usuario.id,                      
							    nombre: usuario.nombre,  
							    apellido: usuario.apellido,  
							    fotoPerfil: usuario.foto,  
							    genero: usuario.genero,  
							    zona: usuario.zona, 
							 	fechaAlta: new Date() 
							  });

							  user.save(function(err){
							    if ( err ) throw err;
							    console.log("User Saved Successfully");
							  });  
					},
		getUser: function(userId){
				return User.findOne({'id': userId}, function(err, user){
		              if (err) return console.error(err);
		              return user;          
		        });
		},
		getFBInformation: function(senderID,callback){
		      request("https://graph.facebook.com/v2.6/"+ senderID +"?access_token=" + config.get('pageAccessToken')  + ".", function(error, response, body) {
		              var user = JSON.parse(body);
		              callback(user);
		          });
		},
		getAll: function(fn){
			User.find(function(err, users) {
			  if (err)  console.error(err);
			  		fn(users);
			});
		}	
}


