import { devs, guildId, channels } from '../../config.json'
import * as ticketService from '../service/ticket'
import * as channelService from '../service/channel'
import registerCommands from '../utils/registerCommands'
import getLocalCommands from '../utils/getLocalCommands'

module.exports = (client) => {
    client.on('ready', () => {
        registerCommands(client)
        console.log("Discord bot ready!")
    })

    client.on('messageCreate', (message) => {
        if(message.channel.parentId == channels.ticketsCategory && message.channelId != channels.openTicket){
            channelService.recordMessage(client, message)
        }
    })

    client.on('interactionCreate', async (interaction) => {
        try {
            if(!interaction.isChatInputCommand() && !interaction.isButton()) return
            
            //Validations
            const localCommands = await getLocalCommands()
            const commandObject = await localCommands.find( (cmd) => {
                if(interaction.isChatInputCommand()){
                    return cmd.name === interaction.commandName
                } else if (interaction.isButton()){
                    return cmd.name === interaction.customId
                }
            })
            if (!commandObject) return
            if (commandObject.devOnly){
                if (!devs.includes(interaction.member.id)){
                    interaction.reply({
                        content: 'Only developers are allowed to run this command.',
                        ephemeral: true
                    })
                    return
                }
            }

            await commandObject.callback(client, interaction)

        } catch (error) {
            console.log(`There wan an error running this command: ${error}`)
        }
    })
}