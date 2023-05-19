import mongoose, { mongo } from "mongoose";
require('dotenv').config()

const databaseConnection = async () => {
    if(!global.mongoose){
        mongoose.set('strictQuery', false)
        global.mongoose = await mongoose.connect(process.env.MONGODB_URI)
    }
}

export default databaseConnection