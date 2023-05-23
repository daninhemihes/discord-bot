import { ticketCategoryId, botId } from '../../../config.json'
import { EmbedBuilder, ApplicationCommandOptionType, ChannelType } from "discord.js"
import * as ticketService from '../../service/ticket'

module.exports = {
    name: 'chamado',
    description: 'Forneça o máximo de detalhes para a IA abrir o seu ticket, incluindo o seu setor e localização.',
    // devOnly: Boolean,
    // deleted: Boolean,
    options: [
        {
            name: 'descricao',
            description: 'Mensagem que será utilizada para a IA criar o seu chamado.',
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    callback: async (client, interaction) => {
      interaction.reply(`Sua solicitação foi recebida! Você pode visualizá-la na categoria 'Tickets', neste mesmo servidor.`)
        const message = interaction.options.getString('descricao')
        const ticket = await ticketService.openTicketAuto(message, 'discord', interaction.member.id)
        const ticketCategory = await interaction.guild.channels.cache.find(categories => categories.id == ticketCategoryId)
        const ticketAgent = await interaction.guild.members.cache.find(members => members.id == ticket.agentId)
        const ticketOpenedMsg = await ticketService.openTicketMessageAuto(ticket.description)
        console.log(ticketOpenedMsg)
        await ticketCategory.children.create({
            type: ChannelType.GuildText,
            name: `${ticket.title}`,
            permissionOverwrites: [
                {
                  id: interaction.guildId,
                  deny: ['ViewChannel'],
        
                },
                {
                  id: interaction.user.id,
                  allow: ['ViewChannel'],
                },
                {
                  id: botId,
                  allow: ['ViewChannel'],
                },
              ],
        })
        .then( channel => {
            const embed = new EmbedBuilder()
            .setColor(0x2BB673)
            .setAuthor({name: interaction.user.username})
            .setTitle(ticket.title)
            .setDescription(ticket.description)
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: 'Type', value: ticket.type, inline: true},
                { name: 'Grupo', value: ticket.group, inline: true},
                { name: 'Local', value: ticket.place, inline: true},
                { name: 'Prioridade', value: ticket.priority, inline: true},
                { name: 'Status', value: ticket.type, inline: true},
                { name: 'Agente', value: ticketAgent.user.username, inline: true},
            )
            .setTimestamp()
            channel.send({ embeds: [embed] });
            channel.send({ content: `ticketOpenedMsg`})
        })
    }
}