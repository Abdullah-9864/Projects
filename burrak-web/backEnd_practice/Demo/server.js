const express=require("express")
const app=express();
app.get("/", (req, res) => {
    res.send("Here are the users");
});

app.listen(3000);