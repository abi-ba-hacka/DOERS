var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Schema Query
//***********
var BeerSchema = new Schema({                    
    pubId: { type: String},
    name: { type: String},
    description: { type: String},
    price: { type: String},
    image: { type: String}    
}, { collection : 'BeerPerLocal' })

var Beer = mongoose.model('Beer', BeerSchema);

module.exports = Beer;