const mongoose = require('mongoose');
const DB_URL =
"mongodb://127.0.0.1:27017/amit?retryWrites=true&w=majority";
mongoose.connect(DB_URL, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
   console.log('DB connected...');
}); 