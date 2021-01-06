const express = require('express');

const routes = require('./routes');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended : true }));
app.use(express.json());
app.use('/', routes);
app.use(express.static('./files'));
app.use(express.static('public'));



app.listen(3000, () => {
    console.log("Vår app lyssnar på port 3000");
});