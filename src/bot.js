require('dotenv').config()

const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ]
  });

client.on('ready', () => {
    console.log("i'm alive!")
})

client.on('messageCreate', (message) => {
    if(message.author.bot) return

    if(message.content == 'oi') message.reply('Olá!')
})

client.login(process.env.DISCORD_TOKEN)