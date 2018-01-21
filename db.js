var mongoose = require('mongoose');
var url ='mongodb://127.0.0.1:27017/misproject';
if(process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME){
    url = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME;
}
mongoose.Promise = global.Promise;
mongoose.connect(url , {useMongoClient: true});

exports.mongoose = mongoose;