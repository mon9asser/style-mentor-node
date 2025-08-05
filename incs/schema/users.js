const mongoose = require("mongoose");

var userShecmal = new mongoose.Schema({
    name: {type: String, require: true},
    email: {type: String, require: true},
    password: {type: String, require: true},
    created_at: {type: Date, default: Date.now},
    is_admin: {type: Boolean, default: false},
});


var Usr = mongoose.model("users", userShecmal );

module.exports = { Usr };