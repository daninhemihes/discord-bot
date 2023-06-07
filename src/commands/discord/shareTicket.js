import dotenv from "dotenv";
dotenv.config({ path:__dirname+`../../.env.${process.env.NODE_ENV}` });
import { ApplicationCommandOptionType } from "discord.js"
import * as ticketService from '../../service/ticket'

module.exports = {
    name: 'compartilharchamado',
    description: 'Compartilha o chamado com um usuário.',
    // devOnly: Boolean,
    // deleted: Boolean,
    options: [
        {
            name: 'usuario',
            description: 'Usuário que receberá o compartilhamento deste chamado.',
            required: true,
            type: ApplicationCommandOptionType.User
        }
    ],
    callback: async (client, interaction) => {
        try{
            await interaction.deferReply();
            if(interaction.channel.parentId != process.env.TICKETS_CATEGORY_ID){
                interaction.editReply(`Para compartilhar um chamado, execute este comando no canal do chamado que deseja compartilhar!`);
                return
            }
            
            //#region Set params for interaction
            let usuario = await interaction.options.getUser('usuario');
            
            await ticketService.setTicketStatus(ticketid, 2);
            await ticketService.setTicketAgent(ticketid, interaction.user);
            //#endregion
            
            const ticketObj = await ticketService.getTicketById(ticketid);
            const ticketChannel = await interaction.guild.channels.fetch(ticketObj.channelId);
            await ticketChannel.permissionOverwrites.edit(
                interaction.user, 
                {ViewChannel: true}
            )
            if([process.env.GROUP_1_CHANNEL, process.env.GROUP_2_CHANNEL, process.env.GROUP_3_CHANNEL].includes(interaction.channel.id)){
                await interaction.message.delete()
                interaction.editReply(`✅ Ticket ${ticketid} atendido por <@${interaction.user.id}>!`)
                ticketChannel.send({ content: `✅ Ticket atendido por <@${interaction.user.id}>!`})
            } else if (interaction.channel.parentId == process.env.TICKETS_CATEGORY_ID ){
                interaction.editReply(`✅ Ticket ${ticketid} atendido por <@${interaction.user.id}>!`)
            }    
        } catch (error) {
            console.log(error)
        }
    }
}