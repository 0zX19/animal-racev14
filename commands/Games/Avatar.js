const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = { 
   config: {
    name: "avatar",
    aliases: ["av"],
    category: "Games",
    description: "Shows Avatar",
    usage: "[username | nickname | mention | ID](optional)",
   },
    run: async (client, message, args) => {
        let user =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]) ||
        message.guild.members.cache.find(
          (r) =>
            r.user.username.toLowerCase() === args.join(" ").toLocaleLowerCase()
        ) ||
        message.guild.members.cache.find(
          (r) =>
            r.displayName.toLowerCase() === args.join(" ").toLocaleLowerCase()
        ) ||
        message.member;
      const webp = user.user.displayAvatarURL({ dynamic: true, size: 4096, format: 'webp'});
      const png = user.user.displayAvatarURL({ dynamic: true, size: 4096, format: 'png' });
      const jpg = user.user.displayAvatarURL({ dynamic: true, size: 4096, format: 'jpg' });
      if (args[0]) {
        message.channel.send({
          embeds: [
            new EmbedBuilder()
            .setTitle(`${user.user.username}'s Avatar`)
            .setColor(client.color)
            .setDescription(`[PNG](${png}) | [JPG](${jpg}) | [WEBP](${webp})`)
            .setImage(png)
            .setFooter({text: message.guild.name, iconURL: message.guild.iconURL() })
          ]
        });
      } else if (!args[0]) {
        message.channel.send({
          embeds: [
            new EmbedBuilder()
            .setTitle(`${user.user.username}'s Avatar`)
            .setColor(client.color)
            .setDescription(`[PNG](${png}) | [JPG](${jpg}) | [WEBP](${webp})`)
            .setFooter({text: message.guild.name, iconURL: message.guild.iconURL() })
          ]
        });
      }
    }
};