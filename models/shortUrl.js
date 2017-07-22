//this is the template/structure for shortUrl datastructure
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const urlSchema = new Schema({
  
  originalURL: String,
  shortURL: String
  
}, {timestamps: true});

const ModelClass = mongoose.model('shortUrl', urlSchema);

module.exports = ModelClass;