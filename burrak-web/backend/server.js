const app = require("./src/app")

const connectDB= require("./src/db/db")


app.get("/", (req, res) => {
    res.send("Here is the response")
})

connectDB()
app.listen(3000, () => {
    console.log("server is running on port 3000")
})