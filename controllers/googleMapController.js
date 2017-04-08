const
config = require('config'), 
googleMapsClient = require('@google/maps').createClient({
    key: config.get('googleMapsClient')
});

module.exports = {
			getCoordinatesAddress: function(address, callback){
			 googleMapsClient.geocode({'address': address , 'components':{'administrative_area': "Buenos Aires", 'country': "AR"}} , function(err, response) {
			      if (!err) {
			      		var results = [];

			      		response.json.results.forEach(function(item){
			      			var address = {};
			      			var latitude = item.geometry.location.lat;
			        		var longitude = item.geometry.location.lng;

			        		address.geoLatLng = { lat: latitude, lng:longitude};
			        		address.formatted_address = item.formatted_address;
			        		address.place_id = item.place_id;

			        		results.push(address);
			      		});
			      				        	
			            callback(results);
			      } else {
			      		 callback(undefined);
			       		 console.log('Geocode was not successful for the following reason: ' + status);
			      }
			    });
			}
}


