const { PermissionsBitField } = require('discord.js');
const saveManager = require('../saveManager.js');
const ttsVoices = require('../tts/speech-voice-list.js');

const voiceOptions = Object.keys(ttsVoices);

module.exports = {
    name: "tts-voice",
    aliases: ["tts-voice"],
    description: "Set your voice for TTS speech.",
    options: [
        {
            name: "voice",
            description: "Which voice to use. Use tts-voices to list available voices. Leave blank to see current voice.",
            type: "oneWordString",
            choices: voiceOptions
        }
    ],

    onRun: async (client, interaction, arguments, isTextCommand) => {
        var user;
        if (isTextCommand) {
            user = interaction.author;
        } else {
            user = interaction.user;
        }

        let voice = arguments[0];
 
        if (voice) {
            saveManager.setUserConfig(user.id, "tts-voice", arguments[0]);
            await interaction.reply(`Set TTS voice to \`${voice}\`.`);
        } else {
            await interaction.reply(`You are currently using TTS voice \`${saveManager.getUserConfig(user.id, "tts-voice")}\`.`);
        }
    }
};