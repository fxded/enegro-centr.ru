// routes/index.js
const routes = require('./def_routes');
module.exports = function (app, pool) {
    routes(app, pool);
};
