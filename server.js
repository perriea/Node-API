var express        = require('express');var http           = require('http');var https          = require('https');var bodyParser     = require('body-parser');var methodOverride = require('method-override');var cookieParser   = require('cookie-parser');var cors           = require('cors');var passport       = require('passport');var expressSession = require('express-session');var fs             = require('fs');var favicon        = require('serve-favicon');var app            = express();var colors         = require('./config/color');var error          = require('./app/controllers/error');// varvar ports = { http: 8080, https: 4433 };var httpServer = null;var httpsServer = null;var credentials = { key: fs.readFileSync('./config/ssl/key.pem'), cert: fs.readFileSync('./config/ssl/cert.pem') };// configuration ===========================================// Recuperation des POST// parse application/json app.use(bodyParser.json()); // parse application/vnd.api+json as jsonapp.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/x-www-form-urlencodedapp.use(bodyParser.urlencoded({ extended: true }));// read cookies (needed for auth)app.use(cookieParser());// accept cross domainapp.use(cors());// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUTapp.use(methodOverride('X-HTTP-Method-Override'));// faviconapp.use(express.static(__dirname + '/public'));app.use(favicon(__dirname + '/public/favicon.ico'));// auth// init de session Passportapp.use(expressSession({	secret: 'RANDOM',	resave: true,    saveUninitialized: true}));app.use(passport.initialize());app.use(passport.session());// routes ==================================================require('./app/routes')(app, passport, error); // configure our routesrequire('./config/passport')(passport);// start app ===============================================httpServer = http.createServer(function (req, res) {	res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });	res.end();}).listen(ports.http);httpsServer = https.createServer(credentials, app).listen(ports.https);// shoutout to the userconsole.log(colors.help('Port du serveur HTTP (API) : ' + ports.http));console.log(colors.help('Port du serveur HTTPS (API) : ' + ports.https));// expose app           exports = module.exports = app;