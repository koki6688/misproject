var mongoose = require('mongoose');
var url ='mongodb://mis104project:12QWASZX@ds147544.mlab.com:47544/mis104project';

mongoose.Promise = global.Promise;
mongoose.connect(url , {useMongoClient: true});

exports.mongoose = mongoose;