const { ClusterManager, HeartbeatManager  } = require("discord-hybrid-sharding"); //imports the sharding manager
require("dotenv").config();
const { white, green } = require('chalk');

const manager = new ClusterManager(`${__dirname}/index.js`, {
    totalShards: "auto", // you can set to every number you want but for save mode, use "auto" option
    shardsPerClusters: 2, // Default is 2, you can any bigger number you want
    totalClusters: "auto", // you can set to every number you want but for save mode, use "auto" option
    mode: "process", // you can also choose "worker"
    token: process.env.TOKEN || "YOUR_BOT_TOKEN", //paste your token here
});

manager.on("clusterCreate", (cluster) => console.log(white('[') + green('INFO') + white('] ') + green(`Launched Cluster ${cluster.id}`)));
manager.spawn({ timeout: -1 });
