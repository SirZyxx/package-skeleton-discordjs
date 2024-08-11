let reminders = [];

module.exports = {
    addReminder: function(reminder) {
        reminders.push(reminder);
    },
    checkReminders: function(client) {
        const now = Date.now();
        reminders = reminders.filter(reminder => {
            if (reminder.respawnTime - now <= 5 * 60 * 1000) { // Check if 5 minutes away
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Resource Island Respawning Soon!')
                    .setDescription(`The island at ${reminder.coordinates} is about to respawn!`)
                    .addFields(
                        { name: 'Coordinates', value: reminder.coordinates, inline: true },
                        { name: 'Respawn Time', value: `<t:${Math.floor(reminder.respawnTime / 1000)}:F>`, inline: true }
                    )
                    .setTimestamp();

                reminder.user.send({ embeds: [embed] });
                return false; // Remove the reminder from the list
            }
            return true; // Keep it in the list
        });
    }
};
