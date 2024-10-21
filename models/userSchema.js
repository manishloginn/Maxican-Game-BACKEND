const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  username: String,
  grid: [[Number]], 
  markedNumbers: [[Boolean]], 
  winner: { type: Boolean, default: false } 
});

module.exports = mongoose.model('User', userSchema);
