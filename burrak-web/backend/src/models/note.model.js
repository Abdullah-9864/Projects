const mongoose = require("mongoose");
const noteScheme = new mongoose.Scheme({
    title: String,
    description:String,
})


const noteModel = mongoose.model("note", noteSchema)

module.exports-notemodel
 
 