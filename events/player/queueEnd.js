const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const GLang = require("../../settings/models/Language.js");
const Setup = require("../../settings/models/Setup.js");

module.exports = async (client, player) => {
	const channel = client.channels.cache.get(player.textChannel);
	if (!channel) return;

	if (player.twentyFourSeven) return;

    const guildModel = await GLang.findOne({ guild: channel.guild.id });
    const { language } = guildModel;

	/////////// Update Music Setup ///////////

	await client.UpdateMusic(player);
	await client.clearInterval(client.interval);

	const db = await Setup.findOne({ guild: channel.guild.id });
	if (db.enable) return player.destroy();

	////////// End Update Music Setup //////////

    const embed = new EmbedBuilder()
    .setDescription("Thank you for using our service!\n\n**Loving the bot**?\nConsider becoming a [Paypal](https://www.paypal.com/paypalme/andrih1997) & [Saweria](https://saweria.co/andrih) to support our hard work and the future development of the bot, even just a dollar if you can")
    .setColor(client.color)
    .setImage("https://cdn.discordapp.com/attachments/1102585584117088318/1149078240665817168/Screenshot_369.png?ex=65baad01&is=65a83801&hm=c7a556b0a46e04300a980f8322fa7147a9aa2f057a2a0957e4e1fff23a34f895&")

	await channel.send({ embeds: [embed] });
	return player.destroy();
}