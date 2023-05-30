import express from 'express'
import bodyParser from 'body-parser'
import ticketController from './controller/ticket'
import Discord from 'discord.js'
import discordEventHandler from './handlers/discordEventHandler'
import databaseConnection from './utils/database'
import helper from './utils/helper'
require('dotenv').config()

//Initialize express.js API
const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use('/ticket', ticketController)
app.listen(port, () => {
  console.log(`App rodando em http://localhost:${port}`)
})

//Initialize Discord BOT
const client = new Discord.Client({intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent",]});
discordEventHandler(client);
client.login(process.env.DISCORD_TOKEN)

//Initialize Database Connection
databaseConnection()