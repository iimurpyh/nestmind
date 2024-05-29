const SAVE_PATH = './saveData/saveInfo.json';
const fs = require('fs');

let saveData = JSON.parse(fs.readFileSync(SAVE_PATH));

module.exports = {
    setGuildConfig: function(guildId, property, val) {
        if (!saveData.guilds[guildId]) {
            saveData.guilds[guildId] = {};
        }

        saveData.guilds[guildId][property] = val;

        fs.writeFileSync(SAVE_PATH, JSON.stringify(saveData));
    },

    getGuildConfig: function(guildId, property) {
        let guild = saveData.guilds[guildId];
        if (guild) {
            return guild[property];
        } else {
            return saveData.guilds.default[property];
        }
    },

    setUserConfig: function(userId, property, val) {
        if (!saveData.users[userId]) {
            saveData.users[userId] = {};
        }

        saveData.users[userId][property] = val;

        fs.writeFileSync(SAVE_PATH, JSON.stringify(saveData));
    },

    getUserConfig: function(userId, property) {
        let user = saveData.users[userId];
        if (user) {
            return user[property];
        } else {
            return saveData.users.default[property];
        }
    }
}