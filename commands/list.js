const datalinks = require('../scarlet-skies-data/datalinks.json');
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
        for (const articleSearchTerm in datalinks) {
            if (isFirst) {
                isFirst = false;
            } else {
                listString += ", ";
            }
            listString += datalinks[articleSearchTerm].title;
        }
        embed.setDescription(listString);
        await interaction.reply({ embeds: [embed] });
    }
};