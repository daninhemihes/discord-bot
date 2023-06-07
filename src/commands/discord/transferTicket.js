import dotenv from "dotenv";
dotenv.config({ path:__dirname+`../../.env.${process.env.NODE_ENV}` });
import { ApplicationCommandOptionType } from "discord.js"
import * as ticketService from '../../service/ticket'

module.exports = {
    name: 'transferirchamado',
    description: 'Mencione o usuário para o qual deseja transferir o atendimento.',
    // devOnly: Boolean,
    // deleted: Boolean,
        options: [
        {
            name: 'usuario',
            description: 'Usuário que atenderá este chamado.',
            required: true,
            type: ApplicationCommandOptionType.User
        }
    ],
    callback: async (client, interaction) => {
        try{
            await interaction.deferReply()
            const ticket = await ticketService.getTicketByChannel(interaction.channelId)
            const oldAgent = await interaction.guild.members.fetch(ticket.agent.discordId)
            const newAgent = await interaction.options.getUser('usuario')
            const res = await ticketService.transferTicket(ticket.id, {discordId: newAgent.id, name: newAgent.username})
            if (!res){
                interaction.editReply('Não pude transferir o chamado!')
                return
            }

            const channel = await interaction.guild.channels.cache.find(channels => channels.id == ticket.channelId)
            if(ticket.agent.id != process.env.BOT_ID){
                await channel.permissionOverwrites.edit(
                    oldAgent, 
                    {ViewChannel: false}
                )
            }
            await channel.permissionOverwrites.edit(
                newAgent, 
                {ViewChannel: true}
            )
            interaction.editReply(`O atendimento do chamado foi transferido para <@${newAgent.id}>!`)

        } catch (error) {
            interaction.editReply(`Ocorreu um erro durante a transferência de chamados => ${error}`)
            console.log(error)
        }
    }
}