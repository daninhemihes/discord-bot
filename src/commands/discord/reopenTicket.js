import { priorityColors, channels } from '../../../config.json'
import * as ticketService from '../../service/ticket'

module.exports = {
    name: 'reabrirchamado',
    description: 'Reabre o chamado do canal de onde este comando foi executado.',
    callback: async (client, interaction) => {
        try{
            await interaction.deferReply();
            if(interaction.channel.parentId != channels.ticketsCategory){
                interaction.editReply(`Para reabrir um chamado, execute este comando no canal do chamado que deseja reabrir!`);
                return
            }

            ticketService.reopenTicket({channelId: interaction.channelId})
            const ticketObj = await ticketService.getTicketByChannel(interaction.channelId);
            interaction.channel.edit({ name: `${priorityColors[ticketObj.priority-1].emoji}${interaction.channel.name.slice(1)}` })
            await interaction.channel.permissionOverwrites.edit(
                interaction.guild.id, 
                {SendMessages: true}
            )
            interaction.editReply(`🔓 <@${interaction.user}> reabriu o chamado!`)
        } catch (error) {
            console.log(error)
        }
    }
}