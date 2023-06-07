import dotenv from "dotenv";
dotenv.config({ path:__dirname+`../../.env.${process.env.NODE_ENV}` });
import { ApplicationCommandOptionType } from "discord.js"
import * as ticketService from '../../service/ticket'

module.exports = {
    name: 'atenderchamado',
    description: 'Habilita o atendimento de um chamado para o seu usuário.',
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
            if(interaction.channel.parentId != process.env.TICKETS_CATEGORY_ID && 
                ![process.env.GROUP_1_CHANNEL, process.env.GROUP_2_CHANNEL, process.env.GROUP_3_CHANNEL].includes(interaction.channel.id)){
                interaction.editReply(`Para atender um chamado, execute este comando no canal do seu grupo de chamados ou no próprio chamado!`);
                return
            }
            //#region Set params for interaction
            let ticketid;
            if(interaction.isButton()){
                ticketid = interaction.params.ticketid;
            } else {
                ticketid = await interaction.options.getNumber('ticket');
            }
            const ticketClosed = await (await ticketService.getTicketById(ticketid)).status === 5
            if(ticketClosed){
                await interaction.message.delete()
                await interaction.editReply(`❌ O chamado ${ticketid} já foi finalizado!`);
                return
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