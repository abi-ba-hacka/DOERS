var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Schema Query
//***********
var PubSchema = new Schema({
	id: { type: String },                      
    name: { type: String},
    direction: { type: String},
    geoLatLang: { type: String},
    availableTime: { type: String},
    image: { type: String},
    phone_number: { type: String}
}, { collection : 'Pubs' })

var Pub = mongoose.model('Pub', PubSchema);


module.exports = Pub;