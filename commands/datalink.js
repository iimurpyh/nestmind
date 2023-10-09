const datalinks = require('../ss-data/datalinks (raw).json');
const parts = require('../ss-data/parts.json');
const tools = require('../ss-data/tools.json')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Pages where rich text should not purged. This will almost certainly only ever be Book
const ignoreRichtextList = [
    "Book"
];

// Pages that are missing things like an article title.
const dontFindTagsList = [
    "ReleaseNotes"
];

const dontFindBottomList = [
    "Bot", "Programming", "Storms"
];

function getArticleEmbed(i, page) {
    console.log(i);
    var hasPages = false;
    var text = datalinks[i];
    if (text.indexOf("\t\n") == 0) {
        text = text.slice(2);
    }
    
    var data;
    var type;
    var title = i;
    if (!dontFindTagsList.find(elm => elm == i)) {
        type = text.slice(0, text.indexOf(":"));
        subtitle = type.charAt(0) + type.toLowerCase().slice(1);
    } else {
        type = "Page";
        subtitle = "Page";
    }
    
    if (type == "PART" || type == "SUBSTANCE") {
        data = parts[i];
    } else if (type == "TOOL") {
        // special case for tools here because their name will sometimes contain spaces 
        for (let tool in tools) {
            if (tool.toLowerCase().replace(' ', '') == i.toLowerCase()) {
                title = tool
                data = tools[tool];
            }
        }
    }

    // first newline is the CATEGORY: TITLE thing 
    // also remove richtext
    text = text.slice(text.indexOf("\n"))
    if (!ignoreRichtextList.find(elm => elm == i)) {
        text = text.replace(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, '');
    }

    const articleEmbed = new EmbedBuilder().setTitle(title);

    var credits
    if (data && data.Price) {
        credits = data.Price;
    } else if (data && data.Value) {
        credits = data.Value;
    }
    if (credits == 1) {
        subtitle += " | " + credits + " Credit"
    } else if (credits) {
        subtitle += " | " + credits + " Credits"
    }
    
    var finalText = text;
    

    if (!dontFindBottomList.find(elm => elm == i) && !dontFindTagsList.find(elm => elm == i)) {
        finalText = text.substring(0, text.lastIndexOf("\n\n"));
    }

    var index = 0;
    text.split("\n").forEach(line => {
        if (!(line.indexOf("-") == 1 || line.length < 70 || line.indexOf(":") > 0 || line.length == 0 || line.toUpperCase() === line)) {
            if (finalText.charAt(index + line.length + 1) != "\n") {
                finalText = finalText.substring(0, index + line.length) + " " + finalText.substring(index + line.length + 1);
            }
        }
        if (/[a-zA-Z]/g.test(line) && line.replace(/ *\([^)]*\) */g, "").toUpperCase() === line.replace(/ *\([^)]*\) */g, "")) {
            finalText = finalText.substring(0, index) + "**" + finalText.substring(index, index + line.length) + "**" + finalText.substring(index + line.length);
            index += 4;
        }
        index += line.length + 1;
    })
    
    //finalText = finalText.replace(/(?<!\n)\n(?!\n|-)/g, ' ');
    var lastPage = 0;
    
    if (finalText.indexOf("#pgbreak#") > 0) {
        lastPage = [...finalText.matchAll("#pgbreak#")].length;
        subtitle += ' | ' + (parseInt(page) + 1) + '/' + (lastPage + 1);
        hasPages = true;
        finalText = [...finalText.split("#pgbreak#")][page];
    }
    
    finalText = finalText.replaceAll('#br#', '\n');

    articleEmbed.setDescription("**" + subtitle + "**" + finalText)

    if (data) {
        

        if (data.Malleability != undefined) {
            if (data.Malleability > 0) {
                articleEmbed.addFields({ name: "Malleability", value: (data.Malleability**2).toString(), inline: true }); // malleability**2 is due to the technical malleability being the root of its actual malleability, but it is more far useful to state the actual malleability visible ingame
            } else {
                articleEmbed.addFields({ name: "Fixed Size", value: data.DefaultSize.X + ", " + data.DefaultSize.Y + ", " + data.DefaultSize.Z, inline: true });
            }
            
        }
        if (data.Recipe) {
            articleEmbed.addFields({ name: "Recipe", value: data.Recipe.join(", "), inline: true });
        }
    }
    
    if (!dontFindBottomList.find(elm => elm == i) && !dontFindTagsList.find(elm => elm == i)) {
        var tabList = [...text.substring(text.lastIndexOf("\n\n")).matchAll(":")];

        for (var num in tabList) {
            var index = tabList[num].index + text.substring(0, text.lastIndexOf("\n\n")).length;
            console.log(text.substring(index).indexOf('\n'))
            var name = text.substring(text.substring(0, index).lastIndexOf('\n') + 1, index);
            var val = text.substring(index + 2, text.substring(index).indexOf('\n') + text.substring(0, index).length);
            if (name != "Requires" && name != "Malleability") {
                articleEmbed.addFields({ name: name, value: val, inline: true });
            }
        }
    }

    return [articleEmbed, hasPages, lastPage];
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


    onRun: async (client, interaction, arguments) => {
        article = arguments[0];

        if (!article) {
            await interaction.reply("You have to include the name of an article. Use the list command to see the available options.");
            return;
        }
        
        for (let i in datalinks) {
            if (i.toLowerCase() == article.toLowerCase()) {
                var [embed, hasPages] = getArticleEmbed(i, 0);
                console.log(hasPages);
                if (hasPages) {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('datalink back ' + i + ' ' + 0)
                                .setEmoji('⬅️')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('datalink forward ' + i + ' ' + 0)
                                .setEmoji('➡️')
                                .setStyle(ButtonStyle.Primary)
                        );
                    await interaction.reply({ embeds: [embed], components: [row] });
                } else {
                    await interaction.reply({ embeds: [embed] });
                }
                return;
                
            }
        }
        await interaction.reply("Article not found.")
    },

    onButton: async (client, interaction) => {
        [command, direction, article, page] = interaction.customId.split(" ");
        page = parseInt(page);
        if (direction == "forward") {
            page += 1;
        } else if (direction == "back") {
            page -= 1;
        }
        console.log(article, interaction.customId);
        var [embed, hasPages, lastPage] = getArticleEmbed(article, page);
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
                .setDisabled(page == lastPage)
        );
        await interaction.update({ embeds: [embed], components: [row] });
    }
};
