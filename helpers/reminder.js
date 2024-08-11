const fs = require('fs');
const path = './helpers/reminders.json';

// Load existing reminders from the JSON file
function loadReminders() {
    if (fs.existsSync(path)) {
        const data = fs.readFileSync(path, 'utf8');
        return JSON.parse(data);
    }
    return [];
}

// Save reminders to the JSON file
function saveReminders(reminders) {
    fs.writeFileSync(path, JSON.stringify(reminders, null, 4));
}

module.exports = {
    addReminder: function(reminder) {
        const reminders = loadReminders();
        reminders.push(reminder);
        saveReminders(reminders);
        console.log('Added reminder!');
    },
    checkReminders: function() {
        const now = Date.now();
        let reminders = loadReminders();
        reminders = reminders.filter(reminder => {
            const respawnFormula = reminder.respawnTime - now <= 5 * 60 * 1000;
            console.log(`reminder: ${respawnFormula}`);
            if (respawnFormula) { // Check if 5 minutes away
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
        saveReminders(reminders);
    }
};
