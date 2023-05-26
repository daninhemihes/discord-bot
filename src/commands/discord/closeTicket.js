import { ticketCategoryId, botId } from '../../../config.json'
import { PermissionFlagsBits } from "discord.js"
import * as ticketService from '../../service/ticket'

module.exports = {
    name: 'fecharchamado',
    description: 'Fecha o chamado do canal de onde este comando foi executado.',
    // devOnly: Boolean,
    // deleted: Boolean,
    callback: async (client, interaction) => {
        try{
            ticketService.closeTicket({channelId: interaction.channelId})
            interaction.reply(`<@${interaction.user}> chamado finalizado!`)
            return await interaction.channel.delete()
        } catch (error) {
            console.log(error)
        }
    }
}