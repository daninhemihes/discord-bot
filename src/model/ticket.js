import dotenv from "dotenv";
dotenv.config({ path:__dirname+`../../../.env.${process.env.NODE_ENV}` });
import { ticket } from './../../config.json'
import mongoose from "mongoose"

/*-------------------- START: SCHEMA --------------------*/
const TicketSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        minLength: 1,
        maxLength: 3,
        required: true
    },
    group: {
        type: Number,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    priority: {
        type: Number,
        minLength: 1,
        maxLength: 5,
        required: true
    },
    source: {
        type: String,
        default: 'Discord'
    },
    status: {
        type: Number,
        minLength: 1,
        maxLength: 5,
        default: 1
    },
    dateOpened: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    },
    dateClosed: {
        type: Date
    },
    reporter: {
        discordId: String,
        name: String
    },
    agent: {
        discordId: {
            type: String,
            default: process.env.BOT_ID
        },
        name: {
            type: String,
            default: 'Justinho'
        },
    },
    share: [{
        discordId: String,
        name: String
    }],
    channelId: String
});


const TicketHistorySchema = new mongoose.Schema({
    ticketId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Ticket'
    },
    updatedFields: Object,
    updatedAt: {
      type: Date,
      default: () => Date.now()
    }
});
/*-------------------- END: SCHEMA --------------------*/

/*-------------------- START: METHODS --------------------*/
TicketSchema.methods.map = function(field) {
    let value = String
    switch(field){
        case 'type': 
            value = ticket.type[this.type-1]
            break
        case 'group': 
            value = ticket.group[this.group-1].name
            break
        case 'priority': 
            value = ticket.priority[this.priority-1]
            break
        case 'status': 
            value = ticket.status[this.status-1]
            break
    }
    return value
}
TicketSchema.methods.groupChannel = function() {
    switch(this.group){
        case 1:
            return process.env.GROUP_1_CHANNEL;
        case 2:
            return process.env.GROUP_2_CHANNEL;
        case 3:
            return process.env.GROUP_3_CHANNEL;
    }
}
/*-------------------- END: METHODS --------------------*/

/*-------------------- START: MIDDLEWARE --------------------*/
TicketSchema.pre('save', async function (next){
    if (this.isNew) {
        try {
            const lastTicket = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
            const lastId = lastTicket ? lastTicket.id : 0;
            this.id = lastId + 1;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
})

TicketSchema.post('updateOne', async function(doc) {
    const updatedFields = this.getUpdate();

    try {
        const ticketHistory = new TicketHistory({
        ticketId: doc.id,
        updatedFields
        });
        await ticketHistory.save();
    } catch (error) {
        console.error('Error saving ticket history:', error);
    }
});

/*-------------------- END: MIDDLEWARE --------------------*/

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema)
export const TicketHistory = mongoose.models.TicketHistory || mongoose.model('TicketHistory', TicketHistorySchema);