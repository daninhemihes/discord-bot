import { devs, guildId } from '../../config.json'
import registerCommands from '../utils/registerCommands'
import getLocalCommands from '../utils/getLocalCommands'

module.exports = (client) => {
    client.on('ready', () => {
        registerCommands(client)
        console.log("Discord bot ready!")
    })

    client.on('interactionCreate', async (interaction) => {
        try {
            let commandName
            if(interaction.isChatInputCommand()) commandName = interaction.commandName
            else if (interaction.isButton()) commandName = interaction.customId
            else return

            
            //Validations
            const localCommands = await getLocalCommands()
            const commandObject = await localCommands.find( (cmd) => cmd.name === commandName)
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