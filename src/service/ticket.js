import databaseConnection from '../utils/database'
import openai from '../utils/openai'
import Ticket from '../model/ticket'
import { botId } from '../../config.json'

export const openTicket = async (ticket) => {
    await databaseConnection()
    const createdTicket = await Ticket.create(ticket)
    return createdTicket._id
}

export const openTicketAuto = async (description, source, reporterId) => {
    let ticket = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: `Interprete o chamado aberto a 
        seguir e retorne apenas o title(resumindo o chamado em no máximo 100 
        caracteres), o type (Problema, Dúvida ou Solicitação), o group 
        (Suporte Técnico, Sistemas Internos, Auditoria, Comercial ou Jurídico), 
        o place e a priority (Baixa, Média, Alta ou Urgente) no formato JSON
        Chamado: ${description}`}],
    }).then( resp => {
        return JSON.parse(resp.data.choices[0].message.content)
    })

    ticket.description = description
    ticket.source = source
    ticket.status = 'opened'
    ticket.dateOpened = new Date()
    ticket.reporterId = reporterId
    ticket.agentId = botId

    await databaseConnection()
    const createdTicket = await Ticket.create(ticket)
    return createdTicket
}

export const openTicketMessageAuto = async (description) => {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: `Retorne apenas uma mensagem, 
        em tom claro e direto, que será enviada pelo discord por um humano 
        e com no máximo 500 caracteres. O usuário acabou de abrir um chamado 
        no sistema, você deve informar que o chamado já está na fila para 
        ser atendido e se for o caso, forneça sugestões de como resolver o 
        chamado sozinho enquanto não é atendido. Se não for possível fazer 
        sugestões, apenas informe-o que aguarde. Se resolver, oriente o usuário 
        a apenas finalizar o chamado.
        Chamado: ${description}`}],
    }).then( resp => {
        return resp.data.choices[0].message.content
    })
    return response
}