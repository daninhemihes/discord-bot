import openai from '../utils/openai'
import Ticket from '../model/ticket'
import User from '../model/user'
import { botId } from '../../config.json'

export const openTicket = async (ticket) => {
    const createdTicket = await Ticket.create(ticket)
    return createdTicket._id
}

export const openTicketAuto = async (description, source, reporterId) => {
    let ticket = new Ticket({
        description: description,
        source: source,
        status: 1,
        dateOpened: new Date(),
        reporterId: reporterId,
        agentId: botId,
    })

    await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: `Interprete o chamado aberto a 
        seguir e retorne apenas o title(resumindo o chamado em no máximo 100 
        caracteres), o type (1-Problema, 2-Dúvida ou 3-Solicitação, apenas o número),
         o group (1-Suporte Técnico, 2-Sistemas Internos, 3-SAC Atendimento, apenas o número), 
        o place e a priority (entre 1 e 5, onde 1-Mínima e 5-Crítica) no formato JSON.
        Se não for possível preencher o campo place, retorne ele como uma string 'Tributo Justo'.
        Chamado: ${description}`}],
    }).then( resp => {
        const gptResponse = JSON.parse(resp.data.choices[0].message.content)
        ticket.title = gptResponse.title
        ticket.type = gptResponse.type
        ticket.group = gptResponse.group
        ticket.place = gptResponse.place
        ticket.priority = gptResponse.priority
    })

    for (const prop in ticket){
        if (ticket[prop] === ''){
            ticket.error = '412'
            ticket.description = 'Few details provided to open ticket'
        }
    }

    if (ticket.error) return ticket
    await ticket.save()
    return ticket
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

export const updateTicket = async (ticket) => {
    switch(ticket){
        case ticket._id:
            dosomething()
            break
        
    }
}

export const closeTicket = async (ticket) => {

}