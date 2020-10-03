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
            console.log('signin requset: ', data.toString());
            const   userData = JSON.parse(data),
                    item = {    password    : userData.pass,
                                email       : userData.email  };
            
            //console.log('item', item);
            
            ;(async () => {
            const client = await pool.connect()
            try {
                const res = await client.query(
                    'INSERT INTO users (email, passwd) VALUES ($1, $2);',
                    [
                        userData.email,
                        userData.pass
                    ]
                );
                //console.log('the res is:', res);
            } finally {
                // Make sure to release the client before any error handling,
                // just in case the error handling itself throws an error.
                res.send(item);
                res.end();
                client.release();
            }
            })().catch(err => console.log(err.stack));
            
        });
        req.on('end', function(){
            console.log('end of requset');
        });
    });

    //POST route for login
    app.post ('/login', function(req,res){
        req.on('data', function(data){
            const   userData = JSON.parse(data);
            console.log('login requset: ', userData);

            ;(async () => {
            const client = await pool.connect()
            try {
                const answer = await client.query(
                    'SELECT email , passwd FROM users WHERE email = $1 AND passwd = $2;',
                    [
                        userData.email,
                        userData.password
                    ]
                );
                console.log('the res is:', answer.rows[0]);
                // Make sure to release the client before any error handling,
                // just in case the error handling itself throws an error.
                if (answer.rows[0]) {
                    req.session.userId = answer.rows[0]['email'];
                    res.send({data: 'finding is ok'
                            , file: 'userProfile.html'});
                } else {
                    res.send({error:answer, msg:"Something went wrong!"});
                }
           } finally {
                res.end();
                client.release();
            }
            })().catch(err => console.log(err.stack));
                   
        });
        req.on('end', function(){
            console.log('end of requset');
        });
    });

    // GET route after registering
    app.get('/profileUser', function (req, res, next) {
        console.log('profile requset: ', req.session);
        if (req.session.userId) {
            res.send({data: 'finding is ok'
                    , user: req.session.userId});
            res.end();
        } else {
            var err = new Error('Not authorized! Go back!');
            err.status = 400;
            console.log('------->session is ended:', err.status);
            res.send({data: err.status});
        }
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

/*        User.findById(req.session.userId).exec(function (error, user) {
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
*/
/*    
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
