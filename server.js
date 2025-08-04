const props = require("dotenv").config().parsed;
const express = require("express");
const bodyParser = require("body-parser");


// apis 
const {Phrase} = require("./api/ai-phrase-api");

var server = express();


server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true }));

// => AI Phrases Routers (API Path)
server.use("/api", Phrase );

server.listen(props.port, () => console.log(`This server listens to port ${props.port}`));