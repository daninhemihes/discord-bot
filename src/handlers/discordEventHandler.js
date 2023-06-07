import dotenv from "dotenv";
dotenv.config({ path:__dirname+`../../.env.${process.env.NODE_ENV}` });
import { devs } from '../../config.json'
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
        if(message.channel.parentId == process.env.TICKETS_CATEGORY_ID && message.channelId != process.env.OPEN_TICKET_ID){
            channelService.recordMessage(client, message)
        }
    })

    client.on('interactionCreate', async (interaction) => {
        try {
            if(!interaction.isChatInputCommand() && !interaction.isButton()) return
            const localCommands = await getLocalCommands()
            const commandObject = await localCommands.find( (cmd) => {
                if(interaction.isChatInputCommand()){
                    return cmd.name === interaction.commandName
                } else if (interaction.isButton()){
                    if( interaction.customId.includes("?")){
                        interaction.params = {}
                        const customId = interaction.customId.split("?")
                        interaction.customId = customId[0]
                        const customIdParams = customId[1].split("&")
                        customIdParams.forEach(element => {
                            const param = element.split('=')
                            interaction.params[param[0]] = param[1]
                        });
                    }
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