require('dotenv').config()
const Discord = require('discord.js')

const client = new Discord.Client({
    intents: [
      "Guilds",
      "GuildMembers",
      "GuildMessages",
      "MessageContent",
    ]
  });

client.on('ready', () => {
    console.log("Discord bot ready!")
})

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return
    
})

client.login(process.env.DISCORD_TOKEN)