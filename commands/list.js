const datalinks = require('../ss-data/datalinks (raw).json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "list",
    aliases: ["list"],
    description: "Displays a list of articles in the Scarlet Skies help menu.",
    options: [],

    onRun: async (client, interaction) => {
        const embed = new EmbedBuilder().setTitle("Article List");
        var listString = "";
        var isFirst = true;
        for (let i in datalinks) {
            if (isFirst) {
                isFirst = false;
            } else {
                listString += ", "
            }
            listString += i 
        }
        embed.setDescription(listString);
        await interaction.reply({ embeds: [embed] });
    }
};