import { ticket } from './../../config.json'
import mongoose from "mongoose"
import * as helper from '../utils/helper'

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
        minLength: 1,
        maxLength: 3,
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
    reporterId: {
        type: String,
        required: true
    },
    agentId: String
})

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
            value = ticket.group[this.group-1]
            break
        case 'priority': 
            value = ticket.priority[this.priority-1]
            break
        case 'status': 
            value = ticket.status[this.status-1]
            break
    }
    console.log(field + ' ' + value)
    return value
}
/*-------------------- END: METHODS --------------------*/

/*-------------------- START: MIDDLEWARE --------------------*/
TicketSchema.pre('save', async function (next){
    const currentDateTime = (await helper.getCurrentNumericDateTime()).toString()
    let sufix = '001';
    let generatedId = `${currentDateTime}${sufix}`

    const existingDoc = await this.constructor.findOne({ id: generatedId })
    if (existingDoc) {
        const highestNumberUsed = await this.constructor
          .find({ id: { $regex: `'^${currentDateTime}'` } })
          .sort({ id: -1 })
          .limit(1);
    
        generatedId = parseInt(highestNumberUsed[0].id + 1)
    }
    console.log(generatedId)
    this.id = generatedId;
    console.log(this.id)
    next();
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