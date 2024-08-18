const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// List of animal emojis used in the race
const animalEmojis = [
    '🐢', '🐇', '🐎', '🐅', '🐆', '🐘', '🦒', '🐄', '🐖', '🐏', '🐕', '🦁', '🐊', '🦅', '🐍', '🦓', '🦌'
];

// Function to select a random animal
function getRandomAnimal() {
    return animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
}

// Function to select a random winner from participants who reached 100%
function getRandomWinner(winners) {
    return winners[Math.floor(Math.random() * winners.length)];
}

module.exports = {
    config: {
        name: 'race',
        description: 'Start an animal race',
        usage: 'race',
        aliases: ['race'],
        category: 'Games',
        accessableby: 'Members',
    },
    cooldown: 5,
    run: async (client, message, args) => {
        try {
            const participants = [];
            let commandInvokerId = message.author.id; // Track the ID of the user who invoked the command

            // Embed for starting the race
            const raceEmbed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle('🏁 Animal Race!')
                .setDescription('Click the "Join" button to join the race!\nClick the "Start" button to begin the race!');

            // ActionRow to hold Join, Leave, and Start buttons
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('join_race')
                        .setLabel('Join (0/10)')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('leave_race')
                        .setLabel('Leave')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('start_race')
                        .setLabel('Start')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true) // Disabled initially until there are participants
                );

            // Send initial message with buttons
            const raceMessage = await message.channel.send({ embeds: [raceEmbed], components: [buttons] });

            // Collector for button interactions
            const collector = raceMessage.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'join_race') {
                    if (participants.length < 10) {
                        if (!participants.some(p => p.id === interaction.user.id)) {
                            const participant = {
                                id: interaction.user.id,
                                name: interaction.user.username,
                                emoji: getRandomAnimal(),
                                progress: 0
                            };
                            participants.push(participant);

                            // Update button with participant count
                            buttons.components[0].setLabel(`Join (${participants.length}/10)`);
                            buttons.components[2].setDisabled(participants.length < 2); // Enable start button if at least 2 participants
                            await raceMessage.edit({ components: [buttons] });

                            // Embed for join notification
                            const joinEmbed = new EmbedBuilder()
                                .setColor(client.color)
                                .setTitle('🏁 Joined the Race!')
                                .setDescription(`${interaction.user.username} has joined the race!`);

                            await interaction.reply({ embeds: [joinEmbed], ephemeral: true });
                        } else {
                            await interaction.reply({ content: `You have already joined!`, ephemeral: true });
                        }
                    } else {
                        await interaction.reply({ content: `The race is full! Maximum 10 participants.`, ephemeral: true });
                    }
                } else if (interaction.customId === 'leave_race') {
                    const index = participants.findIndex(p => p.id === interaction.user.id);
                    if (index !== -1) {
                        participants.splice(index, 1);

                        // Update button with participant count
                        buttons.components[0].setLabel(`Join (${participants.length}/10)`);
                        buttons.components[2].setDisabled(participants.length < 2); // Disable start button if less than 2 participants
                        await raceMessage.edit({ components: [buttons] });

                        // Embed for leave notification
                        const leaveEmbed = new EmbedBuilder()
                            .setColor(client.color)
                            .setTitle('🚪 Left the Race')
                            .setDescription(`${interaction.user.username} has left the race.`);

                        await interaction.reply({ embeds: [leaveEmbed], ephemeral: true });
                    } else {
                        await interaction.reply({ content: `You haven't joined the race!`, ephemeral: true });
                    }
                } else if (interaction.customId === 'start_race') {
                    // Check if the interaction user is the command invoker
                    if (interaction.user.id !== commandInvokerId) {
                        return interaction.reply({ content: 'Only the user who started the command can start the race.', ephemeral: true });
                    }

                    if (participants.length < 2) {
                        return interaction.reply({ content: 'At least 2 participants are needed to start the race.', ephemeral: true });
                    }

                    collector.stop(); // Stop collector so no one else can join or leave

                    raceEmbed.setDescription('The race has begun!');
                    await raceMessage.edit({ embeds: [raceEmbed], components: [] });

                    // Simulate the race
                    const interval = setInterval(() => {
                        let raceFinished = false;

                        // Update participants' progress
                        participants.forEach(participant => {
                            participant.progress += Math.floor(Math.random() * 10) + 1;
                            if (participant.progress >= 100) {
                                participant.progress = 100;
                                raceFinished = true;
                            }
                        });

                        // Update embed with the latest progress
                        const updatedEmbed = new EmbedBuilder()
                            .setColor(client.color)
                            .setTitle('🏁 Animal Race!')
                            .setDescription('The animals are running!');

                        for (const participant of participants) {
                            const percentage = Math.min(participant.progress, 100); // Cap the progress at 100%
                            updatedEmbed.addFields({ 
                                name: participant.name, 
                                value: `${participant.emoji} ${'▬'.repeat(percentage / 10)}🏁 (${percentage}%)` 
                            });
                        }

                        raceMessage.edit({ embeds: [updatedEmbed] });

                        // Check if the race is finished
                        if (raceFinished) {
                            clearInterval(interval);

                            // Pick a random winner from those who reached 100%
                            const potentialWinners = participants.filter(p => p.progress === 100);
                            const winner = getRandomWinner(potentialWinners);

                            const embedWinners = new EmbedBuilder()
                                .setColor(client.color)
                                .setTitle('🏁 Animal Race Finished 🏁')
                                .setDescription(`🎉 Race winner: ${winner.emoji} ${winner.name}!\n\n${participants.map(p => `${p.emoji} ${p.name} (${p.progress}%)`).join('\n')}`);

                            message.channel.send({ embeds: [embedWinners] });
                        }
                    }, 1000);
                }
            });

            collector.on('end', async () => {
                if (participants.length === 0) {
                    const embedNoParticipants = new EmbedBuilder()
                        .setColor(client.color)
                        .setTitle('🏁 Animal Race Finished 🏁')
                        .setDescription('No one joined the race.');
                    return message.channel.send({ embeds: [embedNoParticipants] });
                }

                // If the race did not start within 30 seconds, remove the Start button
                await raceMessage.edit({ components: [] });
            });
        } catch (error) {
            console.error('An error occurred while running the race command:', error);
            const embedError = new EmbedBuilder()
                .setColor(client.color)
                .setTitle('🏁 Animal Race Finished 🏁')
                .setDescription('An error occurred while starting the race. Please try again later.');
            message.channel.send({ embeds: [embedError] });
        }
    }
};
