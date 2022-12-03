const mongoose = require("mongoose");

const MoviesSchema = new mongoose.Schema({
    title:String,
    description:String,
    genre:String,
    rating:String,
    added_by:String
});

module.exports = mongoose.model("Movies",MoviesSchema);