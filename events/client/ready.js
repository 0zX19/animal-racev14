const { white, green } = require('chalk');
const Premium = require('../../settings/models/Premium.js')
const { ActivityType } = require('discord.js');


module.exports = async (client) => {
    await client.manager.init(
        client.user.id,
        client.user.username,
        client.cluster.info.TOTAL_SHARDS
        );

    console.log(white('[') + green('INFO') + white('] ') + green(`${client.user.tag} (${client.user.id})`) + white(` is Ready!`));

    const users = await Premium.find();
    for (let user of users) {
        client.premiums.set(user.Id, user);
    }

    setInterval(async () => {
        const promises = [
            client.cluster.broadcastEval("this.guilds.cache.size"),
            client.cluster.broadcastEval((c) => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
        ];

        const results = await Promise.all(promises);

        const servers = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
        const members = results[1].reduce((acc, memberCount) => acc + memberCount, 0);

        const status = [
            { type: ActivityType.Playing, name: `Animal Race Now` },
            { type: ActivityType.Playing, name: `,race` },
        ];

        const index = Math.floor(Math.random() * status.length);

        await client.user.setActivity(status[index].name, { type: status[index].type });
    }, 5000);

};
