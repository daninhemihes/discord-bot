//type: 1 - doubt ; 2 - problem ; 3 - request
//priority: 1 - low ; 2 - medium ; 3 - high ; 4 - urgent

import mongoose from "mongoose"

const TicketSchema = new mongoose.Schema({
    title: String,
    description: String,
    type: String,
    group: String,
    place: String,
    priority: String,
    source: String,
    status: String,
    dateOpened: Date,
    reporterId: String,
    agentId: String
})


export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema)