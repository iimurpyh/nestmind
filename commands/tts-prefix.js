const { PermissionsBitField } = require('discord.js');
const saveManager = require('../saveManager.js');

module.exports = {
    name: "tts-prefix",
    aliases: ["tts-prefix"],
    description: "Set prefix for TTS speech.",
    options: [
        {
            name: "prefix",
            description: "Prefix to replace the existing one with. Leave blank to see current prefix.",
            type: "oneWordString"
        }
    ],

    onRun: async (client, interaction, arguments) => {
        let prefix = arguments[0];
 
        if (prefix) {
            if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                saveManager.setGuildConfig(interaction.guild.id, "tts-prefix", arguments[0]);
                await interaction.reply(`Set TTS prefix to \`${prefix}\`.`);
            } else {
                await interaction.reply(`Only users with the Administrator permission can change server TTS settings.`);
            }
            
        } else {
            await interaction.reply(`The current TTS prefix for this server is \`${saveManager.getGuildConfig(interaction.guild.id, "tts-prefix")}\`.`);
        }
    }
};