import { botId, ticket as configTicket, priorityColors } from '../../config.json'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import openai from '../utils/openai'
import Ticket from '../model/ticket'
import TicketMessage from '../model/channelHistory'

export const getTicketById = async (id) => {
    try{
        const res = await Ticket.findOne({ id: id }).exec()
        return res
    } catch (error) {
        console.log(`Error while trying to get ticket by id: ${error}`)
    }
}

export const getTicketByChannel = async (channelId) => {
    try{
        const res = await Ticket.findOne({ channelId: channelId }).exec()
        return res
    } catch (error) {
        console.log(`Error while trying to get ticket by channelId: ${error}`)
    }
}

export const openTicket = async (ticket) => {
    const createdTicket = await Ticket.create(ticket)
    return createdTicket._id
}

export const openTicketAuto = async (description, source, reporter) => {
    let ticket = new Ticket({
        description: description,
        source: source,
        status: 1,
        dateOpened: new Date(),
        reporter: {
          discordId: reporter.user.id,
          name: reporter.user.username,  
        },
        agent: {
            discordId: botId,
            name: 'Justinho',
        },
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
    try{
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content:`Retorne apenas uma mensagem, 
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
    } catch (error){
        console.log(error)
    }
}

export const setTicketChannel = async (id, channelId) => {
    try{
        const res = await Ticket.updateOne({ id: id }, { channelId: channelId })
        return res.acknowledged
    } catch (error) {
        console.log(error)
    }
}

export const setTicketGroup = async (id, newGroup) => {
    try{
        const res = await Ticket.updateOne({ id: id }, { group: newGroup })
        return res.acknowledged
    } catch (error) {
        console.log(error)
    }
}

export const setTicketStatus = async (id, newStatus) => {
    try{
        const res = await Ticket.updateOne({id: id}, {status: newStatus})
        return res.acknowledged
    } catch (error) {
        console.log(error)
    }
}

export const setTicketAgent = async (id, newAgent) => {
    try{
        const res = await Ticket.updateOne({id: id}, {agent: {discordId: newAgent.id, name: newAgent.username}})
        return res.acknowledged
    } catch (error) {

    }
}

export const shareTicket = async (id, user) => {
    try{
        await Ticket.updateOne(
            { id: id }, { $push: {messages: {
                id: message.id,
                author: {
                    id: message.author.id,
                    username: message.author.username,
                    discriminator: message.author.discriminator
                },
                createdTimestamp: message.createdTimestamp,
                content: message.content
            } } }
        )
    } catch (error) {

    }
}

export const closeTicket = async (ticket) => {
    try{
        if(ticket.id){
            const res = await Ticket.updateOne({ id: ticket.id }, { status: 5, dateClosed: Date.now() })
            return res.acknowledged
        }
        else if(ticket.channelId){
            const res = await Ticket.updateOne({ channelId: ticket.channelId }, { status: 5, dateClosed: Date.now() })
            return res.acknowledged
        }
    } catch (error){
        console.log(error)
    }
}

export const reopenTicket = async (ticket) => {
    try{
        if(ticket.id){
            const res = await Ticket.updateOne({ id: ticket.id }, { status: 2, dateClosed: null })
            return res.acknowledged
        }
        else if(ticket.channelId){
            const res = await Ticket.updateOne({ channelId: ticket.channelId }, { status: 2, dateClosed: null })
            return res.acknowledged
        }
    } catch (error){
        console.log(error)
    }
}

export const recordDiscordMessage = async (channelId, messageData) => {
    try{
        const ticket = await Ticket.findOne({ channelId: channelId })
        const res = await TicketMessage.create({id: ticket.id, status: ticket.status, authorId: messageData.authorId, message: messageData.message})
        console.log(res)
        return res.acknowledged
    } catch (error){
        console.log('Error while trying to record Discord message: ' + error)
    }
}

export const transferTicket = async (ticketId, agent) => {
    try{
        const res = await Ticket.updateOne({ id: ticketId }, { agent: agent })
        return res.acknowledged
    } catch (error) {
        console.log(`Error while trying to transfer ticket: ${error}`)
    }
}

export const buildTicketEmbed = (ticket) => {
    const embed = new EmbedBuilder()
    .setColor(priorityColors[ticket.priority-1].color)
    .setAuthor({name: ticket.reporter.name})
    .setTitle(ticket.title)
    .setDescription(ticket.description)
    .addFields(
        { name: '\u200B', value: '\u200B' },
        { name: 'Tipo', value: ticket.map('type'), inline: true},
        { name: 'Grupo', value: ticket.map('group'), inline: true},
        { name: 'Local', value: ticket.place, inline: true},
        { name: 'Prioridade', value: ticket.map('priority'), inline: true},
        { name: 'Status', value: ticket.map('status'), inline: true},
        { name: 'Agente', value: `<@${ticket.agent.discordId}>`, inline: true},
        )
    .setFooter({text: `Ticket ${ticket.id}`});
    return embed
}

export const buildCloseTicketBtn = () => {
    const button = new ButtonBuilder()
    .setCustomId('fecharchamado')
    .setLabel('Fechar Chamado')
    .setStyle(ButtonStyle.Primary);
    return button
}

export const buildReopenTicketBtn = () => {
    const button = new ButtonBuilder()
    .setCustomId('reabrirchamado')
    .setLabel('Reabrir Chamado')
    .setStyle(ButtonStyle.Primary);
    return button
}

export const buildAttendTicketBtn = (ticketId) => {
    const button = new ButtonBuilder()
    .setCustomId(`atenderchamado?ticketid=${ticketId}`)
    .setLabel('Atender Chamado')
    .setStyle(ButtonStyle.Primary);
    return button
}

export const buildTransferBtns = (originGroup, ticketId) => {
    let buttons = [];
    configTicket.group.forEach(group => {
        const button = new ButtonBuilder()
        .setCustomId(`alterargrupochamado?group=${group.id}&ticketid=${ticketId}`)
        .setLabel(`Transferir ${group.name}`)
        .setStyle(ButtonStyle.Secondary);
        buttons.push(button)
    });
    if (originGroup) buttons.splice((originGroup - 1), 1)
    return buttons
}