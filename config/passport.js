// config/passport.jsvar LocalStrategy    = require('passport-local').Strategy;var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;var TwitterStrategy  = require('passport-twitter').Strategy;// config authvar configAuth = require('./auth');// load up the user modelvar MUsers      = require('../app/models/c_users');// expose this function to our app using module.exportsmodule.exports = function(passport) {    // =========================================================================    // passport session setup ==================================================    // =========================================================================    // required for persistent login sessions    // passport needs ability to serialize and unserialize users out of session    // used to serialize the user for the session    passport.serializeUser(function(user, done) {        done(null, user.id);    });    // used to deserialize the user    passport.deserializeUser(function(id, done) {        MUsers.TUsers.find({ where: { id: id }})        .then(function(user){            done(null, user);        }).error(function(err) {            done(err, null);        });    });    // =========================================================================    // LOCAL SIGNUP ============================================================    // =========================================================================    // we are using named strategies since we have one for login and one for signup    // by default, if there was no name, it would just be called 'local'    passport.use('local-signup', new LocalStrategy({        // by default, local strategy uses username and password, we will override with email        usernameField : 'email',        passwordField : 'password',        passReqToCallback : true // allows us to pass back the entire request to the callback    },    function(req, email, password, done) {        // asynchronous        // User.findOne wont fire unless data is sent back        process.nextTick(function() {            // find a user whose email is the same as the forms email            // we are checking to see if the user trying to login already exists            MUsers.TUsers.find({ where: { email: email }}).then(function(user)            {                // if there are any errors, return the error                // check to see if theres already a user with that email                if (user) {                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));                } else {                    MUsers.TUsers.create({ lastname: "test", firstname: "test", sex: "M", password: MUsers.methods.generateHash(password), email: email, authenticate_type: 1 }).then(function(result) {                        return done(null, result);                    }).catch(function(e) {                        console.log("Inscription locale : Erreur dans la creation de l'utilisateur.");                        return done(e, null);                    });                }            }).catch(function(e) {                console.log("Incription locale : Erreur dans le recherche de l'utilisateur.");                return done(e, null);            });        });    }));    // =========================================================================    // LOCAL LOGIN =============================================================    // =========================================================================    // we are using named strategies since we have one for login and one for signup    // by default, if there was no name, it would just be called 'local'    passport.use('local-login', new LocalStrategy({        // by default, local strategy uses username and password, we will override with email        usernameField : 'email',        passwordField : 'password',        passReqToCallback : true // allows us to pass back the entire request to the callback    },    function(req, email, password, done) { // callback with email and password from our form        // find a user whose email is the same as the forms email        // we are checking to see if the user trying to login already exist        MUsers.TUsers.find({ where: { email: email }}).then(function(user)        {            // if no user is found, return the message            if (!user)                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash            // if the user is found but the password is wrong            if (!MUsers.methods.validPassword(password, user))                return done(null, false, req.flash('loginMessage', 'Oops ! Wrong password.')); // create the loginMessage and save it to session as flashdata            // all is well, return successful user            return done(null, user);        }).catch(function(e) {            console.log("Auth locale : Erreur dans le recherche de l'utilisateur.");            return done(e, null);        });    }));    // =========================================================================    // GOOGLE ==================================================================    // =========================================================================    passport.use(new GoogleStrategy({        clientID        : configAuth.googleAuth.clientID,        clientSecret    : configAuth.googleAuth.clientSecret,        callbackURL     : configAuth.googleAuth.callbackURL,    },    function(token, refreshToken, profile, done)     {        // make the code asynchronous        process.nextTick(function()         {            MUsers.TUsers.find({ where: { email: profile.emails[0].value }}).then(function(user)            {                if (user == null)                 {                    // if the user isnt in our database, create a new user                    MUsers.TUsers.create({ lastname: profile.name.familyName, firstname: profile.name.givenName, sex: "M", email: profile.emails[0].value, authenticate_type: 2 }).then(function(result) {                        return done(null, result);                    }).catch(function(e) {                        console.log("Google OAuth : Erreur dans la creation de l'utilisateur quand il n'existe pas.");                        return done(e, null);                    });                }                 else                 {                    // if a user is found, log them in                    return done(null, user);                }            }).catch(function(e) {                console.log("Google OAuth : Erreur dans le recherche de l'utilisateur.");                return done(e, null);            });        });    }));    // =========================================================================    // TWITTER =================================================================    // =========================================================================    passport.use(new TwitterStrategy({        consumerKey     : configAuth.twitterAuth.consumerKey,        consumerSecret  : configAuth.twitterAuth.consumerSecret,        callbackURL     : configAuth.twitterAuth.callbackURL    },    function(token, tokenSecret, profile, done) {        // make the code asynchronous        process.nextTick(function()         {            console.log(profile);            MUsers.TUsers.find({ where: { email: profile.dataValues.email }}).then(function(user)            {                if (user == null)                 {                    // if the user isnt in our database, create a new user                    MUsers.TUsers.create({ lastname: profile.dataValues.lastname, firstname: profile.dataValues.firstname, email: profile.dataValues.email, authenticate_type: 3 }).then(function(result) {                        return done(null, result);                    }).catch(function(e) {                        console.log("Twitter OAuth : Erreur dans la creation de l'utilisateur.");                    });                }                 else                 {                    // if a user is found, log them in                    return done(null, user);                }            }).catch(function(e) {                console.log("Twitter OAuth : Erreur dans le recherche de l'utilisateur.");                return done(e, null);            });        });    }));};