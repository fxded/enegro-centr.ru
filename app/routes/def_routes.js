// routes/def_routes.js
//const User = require('../models/user');
//const Doctor = require('../models/doctor');

module.exports = function(app, pool) {

    // GET route for reading data
    app.get('/', function(req,res){
        res.sendfile('index.html');
        res.end();
    });

    //POST route for updating data
    app.post('/signin', (req, res) => {
        req.on('data', (data) => {
            console.log('requset: ', data.toString());
            const   userData = JSON.parse(data),
                    item = {    username    : userData.name, 
                                password    : userData.pass,
                                email       : userData.email,
                                speciality  : userData.speciality};
            
            console.log('item', item);
            pool.query('INSERT INTO users (name, age, email, passwd) VALUES ($1, $2, $3, $4);'
                        , [
                            userData.name,
                            32,
                            userData.email,
                            userData.pass
                          ]
                        , (err, res) => {
                console.log(err, res);
                pool.end();
            });

 /*           User.create(item, function (error, user) {
                if (error) {
                    console.log('bd_error: ', error);
                    res.send(error);
                    res.end();
                } else {
                    req.session.userId = user._id;
                    console.log('result of insert: ', user);
                    res.send(user);
                    res.end();
//                    return res.redirect('/profile');
                }
            });*/
        });
        req.on('end', function(){
            console.log('end of requset');
        });
    });
/*
    //POST route for login
    app.post ('/login', function(req,res){
        req.on('data', function(data){
            console.log('requset: ', data.toString());
            const   userData = JSON.parse(data);
                   
            User.authenticate(userData.email, userData.password, function (error, user) {
                if ((error) && !(error.status == 401)) {
                    var err = new Error('Something went wrong at userDB!');
                    err.status = 401;
                    console.log('------->error by userDB', error);
                } else if (error && error.status == 401) {
                    Doctor.authenticate(userData.email, userData.password, function (error, user) {
                        if ((error) && !(error.status == 401)) {
                            var err = new Error('Something went wrong at doctorDB!');
                            err.status = 401;
                            res.send({error:err, msg:"Something went wrong!"});
                            res.end();
                            console.log('------->error by doctorDB', error);
                        } else if (error && error.status == 401) {
                            var err = new Error('Wrong email or password.');
                            err.status = 401;
                            res.send({error:err, msg:"Wrong email or password."});
                            res.end();
                            console.log('------->error authenticate:', error);                         
                        } else {
                            console.log('------->finding doctors:', user);
                            req.session.userId = user._id;
                            res.send({data: 'finding is ok'
                                    , file: 'doctorProfile.html'});
                        }
                    });
                } else {
                    console.log('------->finding user11:', user);
                    req.session.userId = user._id;
                    res.send({data: 'finding is ok'
                            , file: 'patientProfile.html'});                }
            });
        });
        req.on('end', function(){
            console.log('end of requset');
        });
    });

    // GET route after registering
    app.get('/profilePatient', function (req, res, next) {
        User.findById(req.session.userId).exec(function (error, user) {
            if (error) {
                    console.log('------->session is error:', error);
            } else {
                if (user === null) {
                var err = new Error('Not authorized! Go back!');
                err.status = 400;
                console.log('------->session is ended:', err);
                res.redirect('/');
                } else {
                    Doctor.find({ timeToWork: { $gt: []  } }
                                , { speciality: 1, username: 1, timeToWork: 1, _id: 1 }
                                , function (err, timeToWorkdata) {
                                        if (err) throw err;
                                        console.log("=====request from doctors:"
                                                    , timeToWorkdata
                                                    , user.appointment);
                                        res.send({ head: user.username 
                                                 , idPatient: req.session.userId
                                                 , appointment: user.appointment
                                                 , sessionData: timeToWorkdata });
                                        res.end();
                    });
                    //res.render('index');
                }
            }
        });
    });
    
    // Get Doctors profile
    app.get('/profileDoctor', function (req, res, next) {
        Doctor.findById(req.session.userId).exec(function (error, user) {
            if (error) {
                    console.log('------->session is error:', error);
            } else {
                if (user === null) {
                var err = new Error('Not authorized! Go back!');
                err.status = 400;
                console.log('------->session is ended:', err);
                res.redirect('/');
                } else {
                    res.send({ head: '<h1>Name: ' + user.username + '</h1> <h2>Speciality: ' 
                                                 + user.speciality + '</h2>'
                              , appointment: user.temp
                              , timeToWork: user.timeToWork });
                    res.end();
                }
            }
        });
    });

    // GET for logout logout
    app.get('/logout', function (req, res, next) {
        if (req.session) {
            // delete session object
            req.session.destroy(function (err) {
            if (err) {
                console.log('------->error of destroing session:', err);
            } else {
                console.log('------->session destroyed:');
                res.redirect('/');
            }
            });
        }
    });
    
    // POST to set reception time by doctors
    app.post('/setParameter', function (req, res) {
        req.on('data', function(data){
            console.log('setParameter: ', data.toString());
            const   userData = JSON.parse(data);
            Doctor.findOneAndUpdate({ _id: req.session.userId}, userData, {new: true}, 
                                      function(error, user) {
                if (error) {
                        console.log('------->setParameter is error:', error);
                } else {
                    if (user === null) {
                    var err = new Error('setParameter is issue');
                    err.status = 400;
                    console.log('------->setParameter is ended:', err);
                    res.send({error:err, msg:"setParameter is issue."});
                    } else {
                        res.send({data: user});
                        res.end();
                    }
                }
                                          
            });
        });
        req.on('end', function(){
            console.log('end of setParameter');
        });

         //console.log('setParameter', req);
    });

    // POST to select session 
    app.post('/selSession', function (req, res) {
        req.on('data', function(data){
            console.log('------selSession: ', data.toString());
            const   userData = JSON.parse(data);
            if (userData.action) {
                Doctor.findOneAndUpdate({ _id: userData.idDoctor}
                                        , { $push: { temp: { patient: userData.idPatient
                                                            ,name: userData.namePatient
                                                            ,time: userData.time }}
                                        , $pull: { timeToWork: userData.time}}
                                        , {new: true}
                                        , function(error, user) {
                    if (error) {
                            console.log('------->insert temp is error:', error);
                    } else {
                        if (user === null) {
                        var err = new Error('insert temp is issue');
                        err.status = 400;
                        console.log('------->insert temp is ended:', err);
                        res.send({error:err, msg:"insert temp is issue."});
                        } else {
                            User.findOneAndUpdate(
                                  { _id: userData.idPatient}
                                , { $push: { appointment: { 
                                        doctor: userData.idDoctor
                                              , time: userData.time }}}
                                , {new: true}                           
                                , function(error2, user2) {
                                    if (error2) {
                                            console.log('------->insert temp is error:', error2);
                                    } else {
                                        if (user2 === null) {
                                        var err2 = new Error('insert temp is issue');
                                        err2.status = 400;
                                        console.log('------->insert temp is ended:', err2);
                                        res.send({error:err2, msg:"insert temp is issue."});
                                        } else {
                                            res.send({data: user2});
                                            res.end();
                                        }
                                    }
                                });
                        }}});
          } else {
                Doctor.findOneAndUpdate({ _id: userData.idDoctor}
                                        , { $pull: { temp: { patient: userData.idPatient
                                                            ,name: userData.namePatient
                                                            ,time: userData.time }}
                                        , $push: { timeToWork: userData.time}}
                                        , {new: true}
                                        , function(error, user) {
                    if (error) {
                            console.log('------->insert temp is error:', error);
                    } else {
                        if (user === null) {
                        var err = new Error('insert temp is issue');
                        err.status = 400;
                        console.log('------->insert temp is ended:', err);
                        res.send({error:err, msg:"insert temp is issue."});
                        } else {
                            User.findOneAndUpdate(
                                  { _id: userData.idPatient}
                                , { $pull: { appointment: { 
                                        doctor: userData.idDoctor
                                              , time: userData.time }}}
                                , {new: true}                           
                                , function(error2, user2) {
                                    if (error2) {
                                            console.log('------->insert temp is error:', error2);
                                    } else {
                                        if (user2 === null) {
                                        var err2 = new Error('insert temp is issue');
                                        err2.status = 400;
                                        console.log('------->insert temp is ended:', err2);
                                        res.send({error:err2, msg:"insert temp is issue."});
                                        } else {
                                            res.send({data: user2});
                                            res.end();
                                        }
                                    }
                                });
                        }}});
            }
            //res.send(data);
        });
        req.on('end', function(){
            console.log('end of selSession');
        });

         //console.log('setParameter', req);
    });

    */
}
