
const express = require("express");
const app = express();

app.use(express.json())

const notes = []

app.post('/', (req, res) => {
    notes.push(req.body)

    res.status(201).json({
        message: "note created sccessfully"
    })
});

app.get("/", (req, res) => {
    res.status(200).json({
        message: "notes fetched successfully",
        notes: notes

    })
    res.send("Here are the pro users");

});

app.delete("/notes/:index", (req, res) => {
    const index = req.params.index;

    delete notes[index];

    res.status(200).json({
        message: "Note deleted successfully"
    });
});


app.patch("/notes/:index", (req, res) => {

    const index = req.params.index;
    const description = req.body.description

    notes[index].description = description
    res.status(200).json({
        message: "note updated successfully"
    })
});

module.exports = app; 