import { ticketCategoryId, botId } from '../../../config.json'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ApplicationCommandOptionType, ChannelType } from "discord.js"
import * as ticketService from '../../service/ticket'

module.exports = {
    name: 'abrirchamado',
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
      try{
        // Open Ticket Auto and Validate Ticket Information
        await interaction.deferReply({ ephemeral: true })
        const message = interaction.options.getString('descricao')
        const ticket = await ticketService.openTicketAuto(message, 'discord', interaction.member)
  
        if (ticket.error) return interaction.editReply(
          `:x: Para melhor atendê-lo, por favor, abra um novo chamado fornecendo mais detalhes, como seu setor e localização. Obrigado!`
        )
        // Create Ticket channel
        interaction.editReply(`:white_check_mark: Seu chamado está sendo processado! Em alguns segundos, ele estará disponível na categoria "Tickets" neste mesmo servidor.`)
        const ticketAgent = await interaction.guild.members.cache.find(members => members.id == ticket.agent.discordId)
        const ticketOpenedMsg = await ticketService.openTicketMessageAuto(ticket.description)
        const ticketCategory = await interaction.guild.channels.cache.find(categories => categories.id == ticketCategoryId)
  
        const channel = await ticketCategory.children.create({
          type: ChannelType.GuildText,
          name: `ticket-${ticket.id}`,
          position: 0,
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
        ticketService.setTicketChannel(ticket.id, channel.id)

        //#region Default Messages for Your Tickets Channel (reporter)
        const embed = ticketService.buildTicketEmbed(ticket)
        const closeBtn = ticketService.buildCloseTicketBtn()
        const actionRowClose = new ActionRowBuilder()
        .addComponents(closeBtn);
        channel.send({ embeds: [embed], components: [actionRowClose] });
        await helper.sleep(1000)
        channel.send({ content: `<@${interaction.user}> ${ticketOpenedMsg}`})
        //#endregion

        //#region Ticket Alert for Group Channel (agents)
        const attendBtn = ticketService.buildAttendTicketBtn()
        const transferBtns = ticketService.buildTransferBtns(ticket.group, ticket.id)
        const actionRowAttend = new ActionRowBuilder()
        .addComponents(attendBtn)
        transferBtns.forEach(button => {
          actionRowAttend.addComponents(button)
        })
        const groupChannel = await interaction.guild.channels.fetch(ticket.groupChannel())
        groupChannel.send({ embeds: [embed], components: [actionRowAttend] })
        //#endregion
      } catch (error) {
        console.log(`There was an error while opening ticket => ${error}`)
      }
    }
}