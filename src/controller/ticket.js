import { Router } from "express"
import * as ticketService from '../service/ticket'

const router = Router()

router.post('/open', async (req, res) => {
    const result = await ticketService.openTicket(req.body)
    res.status(201).send(result)
})

router.post('/openAuto', async (req, res) => {
    try{
        const result = await ticketService.openTicketAuto(req.body.description)
        res.status(201).send(result)
    }
    catch(err){
        console.log(err)
    }
})

export default router