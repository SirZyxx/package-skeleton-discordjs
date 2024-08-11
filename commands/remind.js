const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const reminders = require('../helpers/reminder.js');
console.error(require('discord.js').version)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('islandreminder')
        .setDescription('Set a reminder for a resource island respawn')
        .addStringOption(option =>
            option.setName('size')
                .setDescription('Size of the island (small/large)')
                .setRequired(true)
                .addChoices([
                    { name: 'Small', value: 'small' },
                    { name: 'Large', value: 'large' }
                ])
        )
        .addIntegerOption(option =>
            option.setName('hours')
                .setDescription('Hours offset')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('Minutes offset')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('coordinates')
                .setDescription('Coordinates of the island')
                .setRequired(true)
        ),

    async execute(interaction) {
        const size = interaction.options.getString('size');
        const hours = interaction.options.getInteger('hours');
        const minutes = interaction.options.getInteger('minutes');
        const coordinates = interaction.options.getString('coordinates');

        // Calculate respawn time
        const offsetHours = size === 'large' ? 72 : 32;
        const currentTime = new Date();
        const respawnTime = currentTime.getTime() + (offsetHours + hours) * 3600000 + minutes * 60000;

        // Store reminder
        reminders.addReminder({ respawnTime, coordinates, user: interaction.user });

        // Create an embed for the response
        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('Resource Island Reminder Set')
            .setDescription(`You have set a reminder for the island at ${coordinates}.`)
            .addFields(
                { name: 'Island Size', value: size.charAt(0).toUpperCase() + size.slice(1), inline: true },
                { name: 'Respawn Time', value: `<t:${Math.floor(respawnTime / 1000)}:F>`, inline: true }
            )
            .setTimestamp();

        // Respond to the command with an embed
        await interaction.reply({ ephemeral: true, embeds: [embed] });
    }
};
