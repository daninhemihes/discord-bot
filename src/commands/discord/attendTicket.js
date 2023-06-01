import { ticket, channels, botId } from '../../../config.json'
import { ActionRowBuilder, ApplicationCommandOptionType } from "discord.js"
import * as ticketService from '../../service/ticket'

module.exports = {
    name: 'atenderchamado',
    description: 'Habilita o atendimento de um chamado para o seu usuário.',
    // devOnly: Boolean,
    // deleted: Boolean,
    options: [
        {
            name: 'ticket',
            description: 'Número do chamado que você deseja atender.',
            type: ApplicationCommandOptionType.Number,   
        }
    ],
    callback: async (client, interaction) => {
        try{
            await interaction.deferReply();
            if(interaction.channel.parentId != channels.ticketsCategory && !ticket.group.some( item => { return interaction.channel.id == item.channelId })){
                interaction.editReply(`Para atender um chamado, execute este comando no canal do seu grupo de chamados ou no próprio chamado!`);
                return
            }
            
            //#region Set params for interaction
            let ticketid;
            if(interaction.isButton()){
                ticketid = interaction.params.ticketid;
            } else {
                ticketid = await await interaction.options.getNumber('ticket');
            }
            await ticketService.setTicketStatus(ticketid, 2);
            await ticketService.setTicketAgent(ticketid, interaction.user)
            //#endregion
            
            const ticketObj = await ticketService.getTicketById(ticketid);
            const ticketChannel = await interaction.guild.channels.fetch(ticketObj.channelId);
            await ticketChannel.permissionOverwrites.edit(
                interaction.user, 
                {ViewChannel: true}
            )
            if(ticket.group.some( item => { return interaction.channel.id == item.channelId })){
                await interaction.message.delete()
                interaction.editReply(`✅ Ticket ${ticketid} atendido por <@${interaction.user.id}>!`)
                ticketChannel.send({ content: `✅ Ticket atendido por <@${interaction.user.id}>!`})
            } else if (interaction.channel.parentId == channels.ticketsCategory ){
                interaction.editReply(`✅ Ticket ${ticketid} atendido por <@${interaction.user.id}>!`)
            }    
        } catch (error) {
            console.log(error)
        }
    }
}