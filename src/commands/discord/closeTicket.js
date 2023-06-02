import { channels } from '../../../config.json'
import { ActionRowBuilder } from "discord.js"
import * as ticketService from '../../service/ticket'

module.exports = {
    name: 'fecharchamado',
    description: 'Fecha o chamado do canal de onde este comando foi executado.',
    callback: async (client, interaction) => {
        try{
            if(interaction.channel.parentId != channels.ticketsCategory){
                interaction.reply('Para finalizar um chamado, execute este comando no canal do chamado que deseja fechar!')
                return
            }

            ticketService.closeTicket({channelId: interaction.channelId})
            interaction.reply(`🔒 <@${interaction.user}> fechou o chamado!`)
            interaction.channel.edit({ name: `🔒${interaction.channel.name.slice(1)}` })
            const reopenBtn = ticketService.buildReopenTicketBtn()
            const actionRowReopen = new ActionRowBuilder()
            .addComponents(reopenBtn);
            interaction.channel.send({ content: `Após a finalização de um chamado, você possui um período de até 30 minutos para reabri-lo, caso seja necessário.`, components: [actionRowReopen] });
            await interaction.channel.permissionOverwrites.edit(
                interaction.guild.id, 
                {SendMessages: false}
            )
            await helper.sleep(1800000) //1800000 = 30min   |   60000 = 1min
            const ticket = await ticketService.getTicketByChannel(interaction.channelId)
            if (ticket.status === 5){
                await interaction.channel.delete()
            }
        } catch (error) {
            console.log(error)
        }
    }
}