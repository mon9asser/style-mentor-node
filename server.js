const props = require("dotenv").config().parsed;
const express = require("express");
const bodyParser = require("body-parser");
 

// apis 
const {Phrase} = require("./api/ai-phrase-api");
const {User} = require("./api/users-api");

var server = express();


server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true }));

// secure layer middleware
server.use(function(req, res, next) {
    const api_key = req.headers['api-key'];
    if(!api_key) {
        return res.status(403).send({
            is_error: true,
            message: "You have no permission!",
            data: []
        });
    }

    if (api_key === props.api_keys) {
        return next();
    }

    return res.status(403).send({
        is_error: true,
        message: "You have no permission!",
        data: []
    });
});


// => AI Phrases Routers (API Path)
server.use("/api", Phrase );
server.use("/api", User);

server.listen(props.port, () => console.log(`This server listens to port ${props.port}`));