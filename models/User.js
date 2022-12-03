const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:false
    },
    name:String,
    email:String,
    password:String,
}) ;

module.exports = mongoose.model("User",UserSchema);