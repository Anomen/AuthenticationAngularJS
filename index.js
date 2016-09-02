var express = require('express');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

let bodyParser      = require('body-parser');
let cookieParser    = require('cookie-parser');
let session         = require('express-session');
let methodOverride  = require('method-override');
let errorHandler    = require('errorhandler');
let morgan          = require('morgan');

//==================================================================
// Define the strategy to be used by PassportJS
passport.use(new LocalStrategy(
  function(username, password, done) {
    if (username === "admin" && password === "admin") // stupid example
      return done(null, {name: "admin"});

    return done(null, false, { message: 'Incorrect username.' });
  }
));

// Serialized and deserialized methods when got from session
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
  if (!req.isAuthenticated()) 
  	res.send(401);
  else
  	next();
};
//==================================================================

// Start express application
var app = express();

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// app.use(express.favicon());
app.use(morgan('dev'));
app.use(cookieParser()); 
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ 
  secret: 'securedsession',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization
// app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

//==================================================================
// routes
app.get('/', function(req, res){
  res.render('index', { title: 'Express' });
});

app.get('/users', auth, function(req, res){
  res.send([{name: "user1"}, {name: "user2"}]);
});
//==================================================================

//==================================================================
// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
  res.send(req.isAuthenticated() ? req.user : '0');
});

// route to log in
app.post('/login', passport.authenticate('local'), function(req, res) {
  res.send(req.user);
});

// route to log out
app.post('/logout', function(req, res){
  req.logOut();
  res.send(200);
});
//==================================================================

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
