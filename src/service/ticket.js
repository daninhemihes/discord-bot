import databaseConnection from '../utils/database'
import openai from '../utils/openai'
import Ticket from '../model/ticket'
const dsclient = require('../bot')


export const openTicket = async (ticket) => {
    await databaseConnection()
    const createdTicket = await Ticket.create(ticket)
    return createdTicket._id
}

export const openTicketAuto = async (description, source, reporterId) => {
    let ticket = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: `Interprete o chamado aberto a seguir e retorne apenas o title, 
        o type (problema, dúvida ou solicitação), o group (suporte técnico, 
            sistemas internos, auditoria, comercial ou jurídico), o place e a priority 
            (baixa, média, alta ou urgente) no formato JSON
            Chamado: ${description}`}],
    }).then( resp => {
        return JSON.parse(resp.data.choices[0].message.content)
    })

    ticket.description = description
    ticket.source = source
    ticket.status = 'opened'
    ticket.dateOpened = new Date()
    ticket.reporterId = reporterId

    await databaseConnection()
    const createdTicket = await Ticket.create(ticket)
    return createdTicket._id
}