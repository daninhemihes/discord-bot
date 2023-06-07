import dotenv from "dotenv";
dotenv.config({ path:__dirname+`../../.env.${process.env.NODE_ENV}` });
import { priorityColors } from '../../../config.json'
import * as ticketService from '../../service/ticket'

module.exports = {
    name: 'reabrirchamado',
    description: 'Reabre o chamado do canal de onde este comando foi executado.',
    callback: async (client, interaction) => {
        try{
            await interaction.deferReply();
            if(interaction.channel.parentId != process.env.TICKETS_CATEGORY_ID){
                interaction.editReply(`Para reabrir um chamado, execute este comando no canal do chamado que deseja reabrir!`);
                return
            }

            await ticketService.reopenTicket({channelId: interaction.channelId})
            const ticketObj = await ticketService.getTicketByChannel(interaction.channelId);
            await interaction.channel.permissionOverwrites.edit(
                interaction.guild.id, 
                {SendMessages: true}
            )
            interaction.message.delete()
            await interaction.editReply(`🔓 <@${interaction.user}> reabriu o chamado!`)
            interaction.channel.edit({ name: `${priorityColors[ticketObj.priority-1].emoji}${interaction.channel.name.slice(1)}` })
        } catch (error) {
            console.log(error)
        }
    }
}