import express from 'express'
import bodyParser from 'body-parser'
import ticketController from './controller/ticket'
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())

app.use('/ticket', ticketController)

app.listen(port, () => {
  console.log(`App rodando em http://localhost:${port}`)
})
