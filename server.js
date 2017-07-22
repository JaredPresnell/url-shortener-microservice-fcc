'use strict';

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var app = express();
var shortUrl = require('./models/shortUrl.js'); //structure of our documents, shortUrl gets the export from models/shortUrl.js
app.use(bodyParser.json());
app.use(cors());

//connect to db
mongoose.connect(process.env.MONGODB_URI);



if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static('public'));
app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
      res.sendFile(process.cwd() + '/public/index.html');
    })

app.get('/new/*', (req, res, next) =>{
  var urlToShorten = req.params[0];  
  //regex from https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
  var urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  if(urlRegex.test(urlToShorten)){
    var randNum = Math.floor(Math.random()*10000).toString();
    var httpRegex = new RegExp("^(http|https)://","i");
    if(httpRegex.test(urlToShorten)===false)
      {
        urlToShorten = "http://"+urlToShorten;
      }
    var data = new shortUrl({
      originalURL: urlToShorten,
      shortURL: randNum
    })//data structure created in models/shortUrl.js
    
    data.save(err=>{
      if(err){
        return res.send('Error saving to database');
      }
    });
    return res.json(data);
  }
  else 
  {
    var data = new shortUrl({
      originalURL: urlToShorten,
      shortURL: "Invalid URL"
    })
    return res.json(data);
  }
});

//query database for shorturl
app.get('/*', function(req, res){
  
  var forwardUrl = req.params[0];  
  shortUrl.findOne({'shortURL': forwardUrl}, function(err, data){
   if(err)
   {
     return res.send("No match found for short URL");
   }
  else 
  {
    res.redirect(301, data.originalURL);
  }
  })
});


// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

