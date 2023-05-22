import { ticketCategoryId, botId } from '../../../config.json'
import { EmbedBuilder, ApplicationCommandOptionType, ChannelType } from "discord.js"
import * as ticketService from '../../service/ticket'

module.exports = {
    name: 'chamado',
    description: 'Forneça o máximo de detalhes para a IA abrir o seu ticket, incluindo o seu setor e localização.',
    // devOnly: Boolean,
    // deleted: Boolean,
    options: [
        {
            name: 'descricao',
            description: 'Mensagem que será utilizada para a IA criar o seu chamado.',
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    callback: async (client, interaction) => {
        const message = interaction.options.getString('descricao')
        const ticket = await ticketService.openTicketAuto(message, 'discord', interaction.member.name)
        console.log(ticket)
        console.log('Chamado v ^ canal')
        const ticketCategory = await interaction.guild.channels.cache.find(categories => categories.id == ticketCategoryId) //verify if x.id is correct
        
        await ticketCategory.children.create({
            type: ChannelType.GuildText,
            name: `${ticket.title}`,
            permissionOverwrites: [
                {
                  id: interaction.guild.id,
                  deny: ['VIEW_CHANNEL'],
        
                },
                {
                  id: interaction.author.id,
                  allow: ['VIEW_CHANNEL'],
                },
                {
                  id: botId,
                  allow: ['VIEW_CHANNEL'],
                },
              ],
        }).then( channel => {
            const embed = new EmbedBuilder()
            .setColor(0x2BB673)
            .setAuthor({name: 'Justinho', iconURL: 'https://styles.redditmedia.com/t5_3b1wr/styles/communityIcon_qdbg6bz0bud71.png?width=256&s=ccf3d06bf3b8056f312f207c7ce906cf69af6efd', url: 'http://portal.tributojusto.com.br'})
            .setTitle(ticket.title)
            .setDescription(ticket.description)
            .addFields(
                { name: 'Tipo', value: ticket.type},
                { name: '' }
            )
            .setTimestamp()
            .setFooter({text: interaction.member.name, iconURL: 'https://styles.redditmedia.com/t5_3b1wr/styles/communityIcon_qdbg6bz0bud71.png?width=256&s=ccf3d06bf3b8056f312f207c7ce906cf69af6efd'})

        })

        interaction.reply(`Chamado recebido!`)

        //const ticketCategory = client.guild.channels.cache.get
        //ticketCategoryId
    }
}