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
        conString   = 'postgresql://testdbuser:testdbuser@127.0.0.1/testdb',
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
    
    // the pool will emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
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
    /*pool.query('SELECT NOW()', (err, res) => {
        console.log(err, res);
        pool.end();
    });**/
    
    /*client.connect();
    
    client.query('SELECT $1::varchar AS my_first_query', ['test db'], (err, res) => {
        console.log(err, res.rows[0]);
        client.end();
    });*/
    /*client.query('INSERT INTO users (name, age) VALUES ($1, $2);', [user.name, user.age], (err, res) => {
        console.log(err, res);
        client.end();
    });
    client.query('SELECT name, age FROM users;', (err, res) => {
        console.log(err, res.rows);
        client.end();
    });*/

    

process.on("SIGINT", () => {
    console.log('\nbye bye'); 
    pool.end();
    process.exit();
});
