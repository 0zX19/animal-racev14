const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { readdirSync } = require("fs");
const { stripIndents } = require("common-tags");
const GPrefix = require('../../settings/models/Prefix');

module.exports = {
    config: {
        name: "help",
        aliases: ["h", "halp", "commands"],
        usage: "(command)",
        category: "Games",
        description: "Displays all commands that the bot has.",
        accessableby: "Members"
    },
    run: async (client, message, args) => {
        const GuildPrefix = await GPrefix.findOne({ guild: message.guild.id });
        const prefix = GuildPrefix.prefix;
        const dirGames = client.commands.filter(c => c.config.category === "Games");
        const dirUtility = client.commands.filter(c => c.config.category === "Utility");

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({ name: `${client.user.username} Help Command!`, iconURL: message.guild.iconURL({ dynamic: true })})
            .setDescription(`
                **Games [${dirGames.size}]**:
                ${dirGames.map(c => `\`${c.config.name}\``).join(", ")}
            `)
            return message.channel.send({ embeds: [embed] })
    }
}