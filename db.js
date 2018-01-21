var mongoose = require('mongoose');
var url ='mongodb://127.0.0.1:27017/misproject';
if(process.env.OPENSHIFT_MONGODB_DB_URL){
    url = process.env.OPENSHIFT_MONGODB_DB_URL + 'mongodb';
}
mongoose.Promise = global.Promise;
mongoose.connect(url , {useMongoClient: true});

exports.mongoose = mongoose;