var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Schema Query
//***********
var MerchandisingSchema = new Schema({
	id: { type: String },                      
    pubId: { type: String},
    name: { type: String},
    description: { type: String},
    price: { type: String},
    image: { type: String}    
}, { collection : 'Merchandisings' })

var Merchandising = mongoose.model('Merchandising', MerchandisingSchema);


module.exports = Merchandising;