const { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder, AttachmentBuilder, PermissionsBitField } = require("discord.js");
const { Manager } = require("erela.js");
const Spotify = require("better-erela.js-spotify").default;
const Deezer = require("erela.js-deezer");
const AppleMusic = require("better-erela.js-apple").default;
const Facebook = require("erela.js-facebook");
const { I18n } = require("locale-parser");
const { ClusterClient, getInfo } = require("discord-hybrid-sharding");

const express = require('express');
const app = express();
const port = 443;
// create main route
app.get('/', (req, res) => res.send('READY !'));
// instantiate server
app.listen(port, () => console.log(`App is listening at http://localhost:${port}`));

class MainClient extends Client {
	 constructor() {
        super({
            shards: getInfo().SHARD_LIST,
            shardCount: getInfo().TOTAL_SHARDS,
            allowedMentions: {
                parse: ["roles", "users", "everyone"],
                repliedUser: false
            },
            intents: [
              GatewayIntentBits.Guilds,
              GatewayIntentBits.GuildMembers,
              GatewayIntentBits.GuildBans,
              GatewayIntentBits.GuildEmojisAndStickers,
              GatewayIntentBits.GuildIntegrations,
              GatewayIntentBits.GuildWebhooks,
              GatewayIntentBits.GuildInvites,
              GatewayIntentBits.GuildVoiceStates,
              GatewayIntentBits.GuildMessages,
              GatewayIntentBits.GuildMessageReactions,
              GatewayIntentBits.GuildMessageTyping,
              GatewayIntentBits.DirectMessages,
              GatewayIntentBits.DirectMessageReactions,
              GatewayIntentBits.DirectMessageTyping,
              GatewayIntentBits.GuildScheduledEvents,
              GatewayIntentBits.MessageContent
            ],
            partials: [
              Partials.Channel,
              Partials.GuildMember,
              Partials.Message,
              Partials.Reaction,
              Partials.User,
              Partials.GuildScheduledEvent
            ],
        });

    this.config = require("./settings/config.js");
    this.button = require("./settings/button.js");
    this.prefix = this.config.PREFIX;
    this.owner = this.config.OWNER_ID;
    this.aliases = new Collection();
    this.dev = this.config.DEV_ID;
    this.color = this.config.EMBED_COLOR;
    this.i18n = new I18n(this.config.LANGUAGE);
    if(!this.token) this.token = this.config.TOKEN;

    process.on('unhandledRejection', error => console.log(error));
    process.on('uncaughtException', error => console.log(error));

	const client = this;

    this.manager = new Manager({
      nodes: this.config.NODES,
      autoPlay: true,
      plugins: [
        new Spotify(),
        new Facebook(),
        new Deezer(),
        new AppleMusic()
      ],
      send(id, payload) {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
    });

    ["aliases", "commands", "premiums"].forEach(x => client[x] = new Collection());
    ["loadCommand", "loadEvent", "loadPlayer", "loadDatabase"].forEach(x => require(`./handlers/${x}`)(client));

    this.cluster = new ClusterClient(this);
	}
		connect() {
        return super.login(this.token);
    };
};
module.exports = MainClient;
