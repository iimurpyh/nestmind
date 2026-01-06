const datalinks = require('../scarlet-skies-data/datalinks.json');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function getArticleEmbed(articleInfo, page) {
    const pageCount = articleInfo.body.length;
    const hasPages = pageCount > 1;
    const creditCost = articleInfo.price;
    const articleEmbed = new EmbedBuilder().setTitle(articleInfo.title);
    
    let subtitle = articleInfo.articleType
    if (creditCost) {
        if (creditCost == 1) {
            subtitle += " | 1 Credit"
        } else {
            subtitle += " | " + creditCost + " Credits"
        }
    }

    if (hasPages) {
        subtitle += " | Page " + (page+1) + "/" + pageCount;
    }

    const bodyText = articleInfo.body[page];

    const description = "**" + subtitle + "**\n\n" + bodyText;
    articleEmbed.setDescription(description)
    
    for (articleField of articleInfo.footerData) {
        console.log(articleField.name, articleField.desc);
        articleEmbed.addFields({ name: articleField.name, value: String(articleField.desc), inline: true });
    }

    return [articleEmbed, hasPages, page >= pageCount - 1];
}


module.exports = {
    name: "datalink",
    aliases: ["dl", "datalink"],
    description: "Displays an article from the Scarlet Skies help menu.",
    options: [
        {
            name: "article",
            description: "Name of the article to display",
            type: "oneWordString"
        }
    ],


    onRun: async (client, interaction, commandArguments) => {
        const article = commandArguments[0];

        if (!article) {
            await interaction.reply("You have to include the name of an article. Use the `list` command to see the available options.");
            return;
        }

        const searchTerm = article.toLowerCase();
        
        if (searchTerm in datalinks) {
            var [embed, hasPages] = getArticleEmbed(datalinks[searchTerm], 0);
            if (hasPages) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('datalink back ' + searchTerm + ' ' + 0)
                            .setEmoji('⬅️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('datalink forward ' + searchTerm + ' ' + 0)
                            .setEmoji('➡️')
                            .setStyle(ButtonStyle.Primary)
                    );
                await interaction.reply({ embeds: [embed], components: [row] });
            } else {
                await interaction.reply({ embeds: [embed] });
            }
            return;
        }
        await interaction.reply("Article not found.")
    },

    onButton: async (client, interaction) => {
        let [command, direction, article, page] = interaction.customId.split(" ");
        page = parseInt(page);
        if (direction == "forward") {
            page += 1;
        } else if (direction == "back") {
            page -= 1;
        }

        const [embed, hasPages, isLastPage] = getArticleEmbed(datalinks[article], page);
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('datalink back ' + article + ' ' + page)
                .setEmoji('⬅️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page == 0),
            new ButtonBuilder()
                .setCustomId('datalink forward ' + article + ' ' + page)
                .setEmoji('➡️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(isLastPage)
        );
        await interaction.update({ embeds: [embed], components: [row] });
    }
};
