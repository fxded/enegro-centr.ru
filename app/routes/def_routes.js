// routes/def_routes.js
//const User = require('../models/user');
//const Doctor = require('../models/doctor');
const   fs      = require('fs');

        
        
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
                    'SELECT email, passwd, id FROM users WHERE email = $1 AND passwd = $2;',
                    [
                        userData.email,
                        userData.password
                    ]
                );
                console.log('the res is:', answer.rows[0]);
                // Make sure to release the client before any error handling,
                // just in case the error handling itself throws an error.
                if (answer.rows[0]) {
                    req.session.userId = answer.rows[0]['id'];
                    req.session.user = answer.rows[0]['email'];
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
                    , user: req.session.user
                    , id: req.session.userId});
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

    //PUT the file
    app.put('/fileUpload', (req, res) => {
        var dataFile = req.files.file,
            filePath = __dirname.split('/').slice(0,4).join('/')
                        + '/userdata/'
                        + req.body.userID
                        +'/';
        try {
            if (!fs.existsSync(filePath)){
                fs.mkdirSync(filePath);
                console.log(filePath, 'created---------------- success')
            }
        } catch (err) {
            console.error(err)
        }
        /*fs.access(filePath, fs.constants.F_OK, (err) => {
            console.log(`${filePath} ${err ? 'does not exist' : 'exists'}`);
        });*/
        console.log('-------------------- request fileUpload',dataFile, req.body, filePath);
        if (fs.existsSync(filePath + dataFile.name)){
            ;(async () => {
            const client = await pool.connect()
            try {
                const res = await client.query(
                    'DELETE FROM files WHERE path_file = $1;',
                    [
                        dataFile.name
                    ]
                );
                //console.log('the res is:', res);
            } finally {
                // Make sure to release the client before any error handling,
                // just in case the error handling itself throws an error.
                client.release();
            }
            })().catch(err => console.log('query---------',err.stack));
        }
        dataFile.mv(filePath + dataFile.name);
        res.writeHead(303, { Connection: 'close', Location: '/' });
        res.end();
        console.log('end of requset');
        
        ;(async () => {
        const client = await pool.connect()
        try {
            const res = await client.query(
                'INSERT INTO files (owner_id, path_file) VALUES ($1, $2);',
                [
                    req.body.userID,
                    dataFile.name
                ]
            );
            //console.log('the res is:', res);
        } finally {
            // Make sure to release the client before any error handling,
            // just in case the error handling itself throws an error.
            client.release();
        }
        })().catch(err => console.log('query---------',err.stack));
        
   });
    
    // GET a list of user files
    app.get('/getList', (req, res) => {
        console.log('getList requset: ', req.session);
        if (req.session.userId) {
            ;(async () => {
            const client = await pool.connect()
            try {
                const result = await client.query(
                    'SELECT * FROM files WHERE owner_id = $1;',
                    [
                        req.session.userId
                    ]
                );
                res.send({  msg: 'finding is ok----',
                            queryData: result.rows 
                        });
                console.log('the res is:', result.rows);
            } finally {
                // Make sure to release the client before any error handling,
                // just in case the error handling itself throws an error.
                client.release();
                res.end();
            }
            })().catch(err => console.log('query---------',err.stack));
            
        } else {
            var err = new Error('Not authorized! Go back!');
            err.status = 400;
            console.log('------->session is ended:', err.status);
            res.send({data: err.status});
        }
    }); 
   //PUT the file
/*    app.post('/fileUpload', (req, res) => {
        var busboy = new Busboy({ headers: req.headers }),
            filePackage = {file: ''};
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            console.log('File [' + fieldname + ']: filename: ' + filename);
            filePackage.filename = filename;
            file.on('data', function(data) {
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
                //console.log(data);
                var saveTo = (
                        __dirname
                        + '/userdata/'
                        + filePackage.userID
                        +'/'
                        + filePackage.filename
                        );
                file.pipe(fs.createWriteStream(saveTo));
                filePackage.fileLength = data.length;
                filePackage.file += data;
            });
            file.on('end', function(data) {
                filePackage.fileLength = filePackage.file.length;
                console.log('File [' + fieldname + '] Finished', data);
            });
        });
        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
            console.log('Field [' + fieldname + ']: value: ' + inspect(val));
            filePackage[fieldname] = inspect(val)
        });
        busboy.on('finish',() => {
            console.log('Done parsing form!', filePackage.fileLength);
            res.writeHead(303, { Connection: 'close', Location: '/' });
            res.end();
            var newFile = fs.createWriteStream(
                    __dirname
                    + '/userdata/'
                    + filePackage.userID
                    +'/'
                    + filePackage.filename
                );
            newFile.write(filePackage.file);
            /*var newFile = fs.createWriteStream(
                    __dirname 
                    + '/'
                    + 
                    + '/draft_data.user');*/
 /*       });
        req.pipe(busboy);        
        //console.log("request fileUpload", busboy);
        /*req.on('data', (data) => {
            const   userData = JSON.stringify(data);
            console.log('upload requset: ', userData);
        });
        req.on('end', function(){
            console.log('end of requset');
        });
    });*/
    
    
    
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
