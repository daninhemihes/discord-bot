import dotenv from "dotenv";
dotenv.config({ path:__dirname+`../../../.env.${process.env.NODE_ENV}` });
import mongoose, { mongo } from "mongoose";

const databaseConnection = async () => {
    if(!global.mongoose){
        mongoose.set('strictQuery', false)
        global.mongoose = await mongoose.connect(process.env.MONGODB_URI)
    }
}

export default databaseConnection