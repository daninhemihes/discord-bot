import { ActionRowBuilder, ApplicationCommandOptionType } from "discord.js"
import * as ticketService from '../../service/ticket'

module.exports = {
    name: 'alterargrupochamado',
    description: 'Altera o grupo para o qual este chamado será destinado.',
    // devOnly: Boolean,
    // deleted: Boolean,
    options: [
        {
            name: 'grupo',
            description: 'Grupo para o qual este chamado será destinado.',
            type: ApplicationCommandOptionType.Number,
            choices: [
                {name: 'Suporte Técnico', value: 1},
                {name: 'Sistemas TI', value: 2},
                {name: 'SAC Atendimento', value: 3}
            ],      
        }
    ],
    callback: async (client, interaction) => {
        try{
            await interaction.deferReply()
            if(interaction.channel.parentId != process.env.TICKETS_CATEGORY_ID && 
                ![process.env.GROUP_1_CHANNEL, process.env.GROUP_2_CHANNEL, process.env.GROUP_3_CHANNEL].includes(interaction.channel.id)){
                interaction.editReply(`Para transferir um chamado, execute este comando no canal do chamado que deseja transferir!`)
                return
            }
            
            //#region Set params for interaction
            let params = { };
            if(interaction.isButton()){
                params.group = parseInt(interaction.params.group);
                params.ticketid = interaction.params.ticketid;
            } else {
                params.group = await interaction.options.getNumber('grupo');
                params.ticketid = await ticketService.getTicketByChannel(interaction.channelId).id;
            }
            await ticketService.setTicketGroup(params.ticketid, params.group)
            //#endregion
            
            //#region Verify if ticket status is waiting
            const ticketObj = await ticketService.getTicketById(params.ticketid)
            if(ticketObj.status != 1) {
                interaction.editReply(`🔄 Ticket ${params.ticketid} transferido por <@${interaction.user.id}>!`)
                return
            }
            //#endregion

            //#region Ticket Alert for New Group Channel (agents)
            const embed = ticketService.buildTicketEmbed(ticketObj)
            const attendBtn = ticketService.buildAttendTicketBtn(ticketObj.id)
            const transferBtns = ticketService.buildTransferBtns(ticketObj.group, ticketObj.id)
            const actionRowAttend = new ActionRowBuilder()
            .addComponents(attendBtn)
            transferBtns.forEach(button => {
                actionRowAttend.addComponents(button)
            })
            const groupChannel = await interaction.guild.channels.fetch(ticketObj.groupChannel())
            groupChannel.send({ embeds: [embed], components: [actionRowAttend] })
            await interaction.message.delete()
            //#endregion

            interaction.editReply(`🔄 Ticket ${params.ticketid} transferido por <@${interaction.user.id}>!`)
            
        } catch (error) {
            console.log(error)
        }
    }
}