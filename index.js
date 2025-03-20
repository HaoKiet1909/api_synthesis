require('dotenv').config();
var express = require('express');
var cors = require('cors');
var serveStatic = require('serve-static');
var path = require('path');

var app = express();
app.use(cors()); // Enable CORS

app.use(cors());
app.use(express.json());
const dynamicRouter = require("./dynamicRouter");
app.use(dynamicRouter); // Sử dụng router động

app.listen(process.env.PORT, function(){
    console.log("Server is running on http://localhost:" + process.env.PORT);
});
