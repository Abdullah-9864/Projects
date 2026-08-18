const express = require('express');
const noteModel= require("./models/note.model")   
const app = express();


app.post("/notes", (req,res)=>{
    const data=req.body
})
module.exports=app