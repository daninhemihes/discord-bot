import { ticket } from '../../config.json'
import mongoose from "mongoose"
import * as helper from '../utils/helper'

/*-------------------- START: SCHEMA --------------------*/
const ChannelHistorySchema = new mongoose.Schema({
    ticketId: {
        type: String,
    },
    channelId: {
        type: String,
        unique: true,
        immutable: true
    },
    messages: [{
        id: {
            type: String,
            immutable: true
        },
        author:{
            id:{
                type: String,
                immutable: true
            },
            username:{
                type: String,
                immutable: true
            },
            discriminator:{
                type: String,
                immutable: true
            },
        },
        createdTimestamp: {
            type: Number,
            immutable: true
        },
        content: {
            type: String,
            immutable: true
        }
    }],

})
/*-------------------- END: SCHEMA --------------------*/

export default mongoose.models.ChannelHistory || mongoose.model('ChannelHistory', ChannelHistorySchema)