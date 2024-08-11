const fs = require('fs');
const { MessageEmbed } = require('discord.js');
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
    addReminder: function (timeLeftUntilDespawn, respawnDurationHours, coordinates, user) {
        const now = Date.now();

        // Convert the time left and respawn duration into milliseconds
        const timeLeftMs = timeLeftUntilDespawn.hours * 60 * 60 * 1000 + timeLeftUntilDespawn.minutes * 60 * 1000;
        const respawnDurationMs = respawnDurationHours * 60 * 60 * 1000;

        // Calculate the exact time when the island will respawn in UNIX format
        const respawnTime = now + timeLeftMs + respawnDurationMs;

        const reminder = {
            respawnTime,
            coordinates,
            user: {
                id: user.id, // Store user ID for later use
            }
        };

        const reminders = loadReminders();
        reminders.push(reminder);
        saveReminders(reminders);

        console.log(`Added reminder! Will remind at: ${new Date(respawnTime).toLocaleString()}`);
    },

    checkReminders: async function (client) {
        const now = Date.now();
        let reminders = loadReminders();

        for (let i = reminders.length - 1; i >= 0; i--) { // Iterate backward to safely remove items
            const reminder = reminders[i];
            const respawnTime = reminder.respawnTime;
            const respawnFormula = respawnTime - now <= 5 * 60 * 1000;

            // console.log(`Checking reminder: ${new Date(respawnTime).toLocaleString()}`);
            if (respawnFormula) { // Check if 5 minutes away
                const embed = new MessageEmbed()
                    .setColor(0xFF0000)
                    .setTitle('Resource Island Respawning Soon!')
                    .setDescription(`The island at ${reminder.coordinates} is about to respawn!`)
                    .addFields(
                        { name: 'Coordinates', value: reminder.coordinates, inline: true },
                        { name: 'Respawn Time', value: `<t:${Math.floor(reminder.respawnTime / 1000)}:F>`, inline: true }
                    )
                    .setTimestamp();

                let dmChannel = await client.users.createDM(reminder.user.id);
                await dmChannel.send({ embeds: [embed] });

                // Remove the reminder from the list
                reminders.splice(i, 1);
            }
        }

        saveReminders(reminders);
    }
};
