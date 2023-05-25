import mongoose from "mongoose"

/*-------------------- START: SCHEMA --------------------*/
const UserSchema = new mongoose.Schema({
    discordId: {
        type: Number,
        unique: true
    },
    discordUsername: {
        type: String,
        required: true
    },
    coreUsername: String,
    name: String,
})
/*-------------------- END: SCHEMA --------------------*/

export default mongoose.models.User || mongoose.model('User', UserSchema)