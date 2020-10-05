// routes/def_routes.js
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
            } finally {
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
            } finally {
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
        } finally {
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

}
