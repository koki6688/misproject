var mongoose = require('mongoose');
var url ='mongodb://mis104project:12QWASZX@ds147544.mlab.com:47544/mis104project';
//var url ='mongodb://localhost:27017/misproject';
mongoose.Promise = global.Promise;


mongoose.connect(url , {useMongoClient: true}, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('mongoDB Connected...');
    }
});




exports.mongoose = mongoose;