const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const reminders = require('../helpers/reminder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('islandreminder')
        .setDescription('Set a reminder for a resource island respawn')
        .addStringOption(option =>
            option.setName('size')
                .setDescription('Size of the island (small/large)')
                .setRequired(true)
                .addChoice('Large', 'large')
                .addChoice('Small', 'small')
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
        const hours = interaction.options.getInteger('hours') - 1;
        const minutes = interaction.options.getInteger('minutes');
        const coordinates = interaction.options.getString('coordinates');
    
        // Determine the respawn duration based on island size
        const respawnDurationHours = size === 'large' ? 72 : 36;
    
        // Calculate the actual respawn time in UNIX format
        const currentTime = new Date().getTime();
        const respawnTime = currentTime + (respawnDurationHours + hours) * 3600000 + minutes * 60000;
    
        // Store the reminder
        reminders.addReminder({ hours, minutes }, respawnDurationHours, coordinates, interaction.user);
    
        // Create an embed for the response
        const embed = new MessageEmbed()
            .setColor(0x00AE86)
            .setTitle('Resource Island Reminder Set')
            .setDescription(`You have set a reminder for the island at ${coordinates}.`)
            .addFields(
                { name: 'Island Size', value: size.charAt(0).toUpperCase() + size.slice(1), inline: true },
                { name: 'Respawn Time', value: `<t:${Math.floor(respawnTime / 1000)}:F>`, inline: true }
            )
            .setTimestamp();
    
        // Respond to the command with an embed
        await interaction.reply({ ephemeral: false, embeds: [embed] });
    }
};
