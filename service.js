const express = require('express');
const session = require('express-session');
const routes = require('./routes');
const bodyParser = require('body-parser');

const app = express();
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.urlencoded({ extended : true }));
app.use(express.json());
app.use('/', routes);
app.use(express.static('./files'));
app.use(express.static('public'));



app.listen(3000, () => {
    console.log("Vår app lyssnar på port 3000");
});
