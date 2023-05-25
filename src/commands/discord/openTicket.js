import { ticketCategoryId, botId } from '../../../config.json'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ApplicationCommandOptionType, ChannelType } from "discord.js"
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

      // Open Ticket Auto and Validate Ticket Information
      const message = interaction.options.getString('descricao')
      const ticket = await ticketService.openTicketAuto(message, 'discord', interaction.member.id)
      
      if (ticket.error) return interaction.reply(
        `:x: Para melhor atendê-lo, por favor, abra um novo chamado fornecendo mais detalhes, como seu setor e localização. Obrigado!`
      )
      // Create Ticket channel
      interaction.reply(`:white_check_mark: Seu chamado está sendo processado! Em alguns segundos, ele estará disponível na categoria "Tickets" neste mesmo servidor.`)
      const ticketAgent = await interaction.guild.members.cache.find(members => members.id == ticket.agentId)
      const ticketOpenedMsg = await ticketService.openTicketMessageAuto(ticket.description)
      const ticketCategory = await interaction.guild.channels.cache.find(categories => categories.id == ticketCategoryId)
      await ticketCategory.children.create({
          type: ChannelType.GuildText,
          name: `${ticket.title}`,
          position: 7,
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
          
          // Create Ticket Embed Message
          const embed = new EmbedBuilder()
          .setColor(0x2BB673)
          .setAuthor({name: interaction.user.username})
          .setTitle(ticket.title)
          .setDescription(ticket.description)
          .addFields(
              { name: '\u200B', value: '\u200B' },
              { name: 'Tipo', value: ticket.map('type'), inline: true},
              { name: 'Grupo', value: ticket.map('group'), inline: true},
              { name: 'Local', value: ticket.place, inline: true},
              { name: 'Prioridade', value: ticket.map('priority'), inline: true},
              { name: 'Status', value: ticket.map('status'), inline: true},
              { name: 'Agente', value: ticketAgent.user.username, inline: true},
          )
          .setTimestamp();

          // Create Button for Close Ticket
          const closeBtn = new ButtonBuilder()
          .setCustomId('closeTicketBtn')
          .setLabel('Fechar Chamado')
          .setStyle(ButtonStyle.Primary);
          const actionRow = new ActionRowBuilder()
          .addComponents(closeBtn);

          // Send Embed and Opened Messages to Ticket Channel
          channel.send({ embeds: [embed], components: [actionRow] });
          channel.send({ content: `<@${interaction.user}> ${ticketOpenedMsg}`})
        })
    }
}