var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.OPENSHIFT_MONGODB_DB_URL + 'process.env.OPENSHIFT_APP_NAME' , {useMongoClient: true});

exports.mongoose = mongoose;