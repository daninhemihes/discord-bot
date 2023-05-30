import Ticket from '../model/ticket'
import ChannelHistory from '../model/channelHistory'

export const recordMessage = async (client, message) => {
    try{
        const channel = await ChannelHistory.exists({ channelId: message.channelId })
        if (channel){
            await ChannelHistory.updateOne(
                { channelId: message.channelId },
                { $push: {messages: {
                    id: message.id,
                    author: {
                        id: message.author.id,
                        username: message.author.username,
                        discriminator: message.author.discriminator
                    },
                    createdTimestamp: message.createdTimestamp,
                    content: message.content
                } } }
            )
        }
        else {
            const ticket = await Ticket.findOne({ channelId: message.channelId }).exec()
            await ChannelHistory.create({
                ticketId: ticket.id,
                channelId: message.channelId,
                messages: [{
                    id: message.id,
                    author: {
                        id: message.author.id,
                        username: message.author.username,
                        discriminator: message.author.discriminator
                    },
                    createdTimestamp: message.createdTimestamp,
                    content: message.content
                }]
            })
        }
    } catch (error){
        console.log('Error while trying to record Discord message: ' + error)
    }
}