require('dotenv').config()
const {REST, Routes} = require('discord.js')

const commands = [
    {
        name: 'openTicket',
        description: 'Please provide the maximum level of detail possible to ensure proper functioning of the AI.'
    },
]

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

(async () => {
    try {
        console.log('Commands are being registered. Please wait patiently as your request is being processed.')
        await rest.put(
            Routes.applicationGuildCommands(process.env.BOT_ID, process.env.GUILD_ID),
            { body: commands }
        )
        console.log('Your commands have been successfully registered.')
    } catch (error){
        console.log(`There was an error: ${error}`)
    }
})()