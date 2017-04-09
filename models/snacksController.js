var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Schema Query
//***********
var SnackSchema = new Schema({
	id: { type: String },                      
    pubId: { type: String},
    name: { type: String},
    description: { type: String},
    price: { type: String},
    image: { type: String}    
}, { collection : 'Snacks' })

var Snacks = mongoose.model('Snack', SnackSchema);


module.exports = Snacks;