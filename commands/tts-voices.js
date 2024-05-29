const { EmbedBuilder } = require('discord.js');
const ttsVoices = require('../tts/speech-voice-list.js');

const voiceOptions = Object.keys(ttsVoices);

module.exports = {
    name: "tts-voices",
    aliases: ["tts-voices"],
    description: "Displays a list of voices to be used with the tts command.",
    options: [],

    onRun: async (client, interaction) => {
        const embed = new EmbedBuilder().setTitle("TTS Voices");
        var listString = "";
        for (let i in voiceOptions) {
            listString += voiceOptions[i] += "\n";
        }
        embed.setDescription(listString);
        await interaction.reply({ embeds: [embed] });
    }
};