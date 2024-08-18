const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const GPrefix = require('../../settings/models/Prefix.js');
const GLang = require('../../settings/models/Language.js');
const GSetup = require("../../settings/models/Setup.js");
const chalk = require('chalk');
const delay = require('delay');

module.exports = async (client, message) => { 
    if (!message.guild || message.author.bot) return;
    /// Create database when not have!
    await client.createSetup(message.guild.id);
    await client.playerControl(message.guild.id);
    await client.createLang(message.guild.id);
    await client.createPrefix(message.guild.id, client.prefix);

    /// Create new member!
    const user = message.client.premiums.get(message.author.id);
    await client.createPremium(message, user);

    const database = await GSetup.findOne({ guild: message.guild.id });
    /// REQUEST MODE!
      if (database.enable) {
        if (!message.guild || !message.guild.available) return;

        const channel = await message.guild.channels.cache.get(database.channel);
        if (!channel) return;

        if (database.channel != message.channel.id) return;

        const guildModel = await GLang.findOne({ guild: message.guild.id });
        const { language } = guildModel;

        if (message.author.id === client.user.id) {
            await delay(1000);
            message.delete()
        }

        if (message.author.bot) return;

            const song = message.cleanContent;
            await message.delete();

            const voiceChannel = await message.member.voice.channel;
            if (!voiceChannel) return message.channel.send(`${client.i18n.get(language, "noplayer", "no_voice")}`).then((msg) => { 
                setTimeout(() => {
                    msg.delete()
                }, 1000);
            });

            const player = await client.manager.create({
                guild: message.guild.id,
                voiceChannel: message.member.voice.channel.id,
                textChannel: message.channel.id,
                selfDeafen: true,
            });

            const state = player.state;
            if (state != "CONNECTED") await player.connect();
            const res = await client.manager.search(song, message.author);
            if(res.loadType != "NO_MATCHES") {
                if(res.loadType == "TRACK_LOADED") {
                    player.queue.add(res.tracks[0]);
                    if(!player.playing) player.play();
                } else if(res.loadType == "PLAYLIST_LOADED") {
                    player.queue.add(res.tracks)
                    if(!player.playing) player.play();
                } else if(res.loadType == "SEARCH_RESULT") {
                    player.queue.add(res.tracks[0]);
                    if(!player.playing) player.play();
                } else if(res.loadType == "LOAD_FAILED") {
                    message.channel.send(`${client.i18n.get(language, "music", "play_fail")}`).then((msg) => { 
                        setTimeout(() => {
                            msg.delete()
                        }, 1000);
                    }).catch((e) => {});
                        player.destroy();
                }
            } else {
                message.channel.send(`${client.i18n.get(language, "music", "play_match")}`).then((msg) => { 
                    setTimeout(() => {
                        msg.delete()
                    }, 1000);
                }).catch((e) => {});
                    player.destroy();
                }

                if (player) {
                    client.UpdateQueueMsg(player);
                }
        /// NORMAL MODE!
        } else {
            const GuildPrefix = await GPrefix.findOne({ guild: message.guild.id });
            const prefix = GuildPrefix.prefix;

            const guildModel = await GLang.findOne({ guild: message.guild.id });
            const language = guildModel.language;

            const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);

            if(message.content.match(mention)) {
                const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: `${client.user.username}`, iconURL: message.guild.iconURL({ dynamic: true })})
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .setDescription(`${client.user.username}'s prefix on the **${message.guild.name}** server is \`\`${prefix}\`\`. Use the \`\`${prefix}help\`\` command to see the entire list of available commands.`)
                message.reply({ embeds: [embed] });
            };
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
            if (!prefixRegex.test(message.content)) return;
            const [ matchedPrefix ] = message.content.match(prefixRegex);
            const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();

            const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
            if(!command) return;

            if (!client.dev.includes(message.author.id) && client.dev.length > 0) { 

            message.channel.send(`${client.i18n.get(language, "message", "dev_only")}`);
            console.log(chalk.bgRedBright(`[INFOMATION] ${message.author.tag} trying request the command from ${message.guild.name}`)); 
            return;
            }

            const botPermissions = ["ViewChannel", "SendMessages", "EmbedLinks"];
            const botMissingPermissions = [];

            for (const perm of botPermissions) {
                if (!message.channel.permissionsFor(message.guild.members.me).has(perm)) {
                    botMissingPermissions.push(perm);
                }
            }

            if (message.content.toUpperCase() === "dor" || message.content.toLowerCase() === "Dor") {
                if (message.guild.members.cache.get(client.user.id).permissionsIn(message.channel).has(PermissionsBitField.Flags.SendMessages)) {
                    return await message.reply("kaget anjing monyet lu").catch(() => { });
                };
            };

            if (botMissingPermissions.length > 0)
                return message.reply({
                    embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`\`❌\` | I don't have one of these permissions \`ViewChannel\`, \`SendMessages\`, \`EmbedLinks\`.\nPlease double check them in your server role & channel settings.`)]
                });

            console.log(chalk.magenta(`[COMMAND] ${command.config.name} used by ${message.author.tag} from ${message.guild.name}`));

            if(!message.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) return await message.author.dmChannel.send(`${client.i18n.get(language, "message", "no_perms")}`);
            if(!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ViewChannel)) return;
            if(!message.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) return await message.channel.send(`${client.i18n.get(language, "message", "no_perms")}`);
            if(!message.guild.members.me.permissions.has(PermissionsBitField.Flags.Speak)) return await message.channel.send(`${client.i18n.get(language, "message", "no_perms")}`);
            if(!message.guild.members.me.permissions.has(PermissionsBitField.Flags.Connect)) return await message.channel.send(`${client.i18n.get(language, "message", "no_perms")}`);
            
            if (command) {
            try {
                if (command.ownerOnly) {
                if (message.author.id !== client.owner) {
                    return message.channel.send(`${client.i18n.get(language, "message", "owner_only")}`);
                }
            }
                command.run(client, message, args, user, language, prefix);
            } catch (error) {
                console.log(error)
                await message.channel.send(`${client.i18n.get(language, "message", "error")}`);
            }
        }
    }
}