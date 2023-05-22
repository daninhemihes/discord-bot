import { devs, guildId } from '../../config.json'
import registerCommands from '../utils/registerCommands'
import getLocalCommands from '../utils/getLocalCommands'

module.exports = (client) => {
    client.on('ready', () => {
        registerCommands(client)
        console.log("Discord bot ready!")
    })

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return
        
        try {
            const localCommands = await getLocalCommands()

            //Validations
            const commandObject = await localCommands.find( (cmd) => cmd.name === interaction.commandName)
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