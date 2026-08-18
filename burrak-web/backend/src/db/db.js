const mongoose = require("mongoose");
async function connectDB(){
    await mongoose.connect("mongodb+srv://abdullahshahid9864_db_user:PLude6t6Z7whNlMx@backendcluster.lo4l76s.mongodb.net/Burrak")
    console.log("connected to DB")
}

module.exports=connnectDB
 