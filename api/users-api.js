var express = require("express");
var {connectDB} = require("./../incs/connect");
var {Usr} = require("./../incs/schema/users");
var sanitizeHtml = require('sanitize-html');

var {isEmail} = require("./../helper/validate");
const bcrypt = require("bcrypt");
var User = express.Router();
 
User.post("/user/login", async (req, res) => {
    
    // => Layer 1
    if( !req.body ) {
        return res.send({
            message: "All fields are required such as `email` and `email`",
            is_error: true,
            data: []
        })
    }

    var required = ["email", "password"];
    var fields = required.filter(field => !( field in req.body ));
    if( fields.length > 0 ) {
         return res.send({
            message: "All fields are required such as `email` and `email`",
            is_error: true,
            data: []
        })
    }

    var password = req.body.password;
    var email = req.body.email;

    // => Layer 2
    if(!isEmail(email)) {
        return res.send({
            is_error: true,
            message: "Invalid email.",
            data: []
        })
    }

    // => Layer 3
    
    try {


        await connectDB();
        var exists = await Usr.findOne({email: email});
        if( exists ) {
            var checkingPassword = await bcrypt.compare( password,exists.password)
            if( checkingPassword ) {

                var returned = {...exists._doc};
                    delete returned.password;
                return res.send({
                    is_error: false,
                    message: "You're logged in successfully!",
                    data: returned
                })
            } else {
                return res.send({
                    is_error: true,
                    message: "There is something wrong, email or password!",
                    data: []
                })
            }
        } else {
             return res.send({
                is_error: true,
                message: "Your email does not exist!",
                data: []
            })
        }
        
    } catch (error) {
        return res.send({
            is_error: true,
            message: "Something went wrong!",
            data: []
        })
    }

   

});

User.post("/user/setup", async (req, res) => {

    // => Layer 0
    if( !req.body ) {
        return res.send({
            message: "All fields are required such as `password`, `email`, and `name`",
            is_error: true,
            data: []
        })
    }

    // => Layer 1
    var fields = ["password", "email", "name"];
    var checking = fields.filter(field => !(field in req.body ));
    if( checking.length > 0 ) {
        return res.send({
            message: "All fields are required such as `password`, `email`, and `name`",
            is_error: true,
            data: []
        })
    }

    var password = req.body.password;
    var email    = req.body.email;
    var name     = sanitizeHtml(req.body.name, {
        allowedAttributes: {},
        allowedClasses: []
    }); 

    // => Layer 2: Check if data is already setuped before 
    await connectDB();
    var setupExists = await Usr.exists({});
    if(setupExists) {
        return res.send({
            is_error: true,
            message: "Setup already completed. You cannot access this route.",
            data: []
        })
    }

    // => Layer 3: Sanitization and validation
    var salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
    
    if( ! isEmail(email)) {
        return res.send({
            is_error: true,
            message: "Invalid email.",
            data: []
        })
    }

    
    // => Store data 
    try { 

        var store = await Usr({
            email,
            password,
            name
        });

        var isStored = await store.save();
        if( isStored ) {
            return res.send({
                message: "You have completed the setup. Well done.",
                is_error: false,
                data: []
            })
        } else {
             return res.send({
                message: "You were very close! Failed to store data.",
                is_error: true,
                data: []
            })
        }
    } catch (error) {
        return res.send({
            message: error.message,
            is_error: true,
            data: []
        })
    }

});



module.exports = { User };
