// server.js
const   port        = process.env.PORT || 3008,
        os          = require('os'),
        greeting    = require('./app/greeting'),
        bodyParser  = require('body-parser'),
        express     = require('express'),
        session     = require('express-session'),
        app         = express(),
        fileUpload = require('express-fileupload'),
        { Pool, Client } = require('pg')
        //conString   = 'postgresql://testdbuser:testdbuser@127.0.0.1/testdb',
        conString   = 'postgres://ddrowhaztfavli:f1673a5f37e784604456ffd54507cc86fd7051183ccfc584586d3103670fcd2a@ec2-52-17-53-249.eu-west-1.compute.amazonaws.com:5432/dafkp8tf9dubg3',
        pool        = new Pool({ connectionString: conString, }),
        client      = new Client({ connectionString: conString, }),
        user = {
            name: 'Vasya',
            age: 32,
        };
        
app.use(express.static(__dirname + '/public'));
app.use(fileUpload());

app.use(session({
    secret: 'aaa2C44-4D44-WppQ38Siuyiuy',
    cookie: {maxAge: 9000000},
    resave: true,
    saveUninitialized: true
}));

    require('./app/routes')(app, pool);
    
    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err)
        process.exit(-1);
    });
    
    app.listen(port, () => {
        let userName = os.userInfo().username;
        console.log(`\n${greeting.date}`);
        console.log(greeting.getMessage(userName) + '! System is started on' , 
                    os.platform(), os.hostname(), os.release() + '. cpu count:',
                    os.cpus().length);
        console.log('Listen on ' + port + ' dir: ' + __dirname + '\n');
    });

process.on("SIGINT", () => {
    console.log('\nbye bye'); 
    pool.end();
    process.exit();
});
