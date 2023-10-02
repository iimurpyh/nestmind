const GLOBAL_CD = 1800 * 1000;
const { EmbedBuilder } = require('discord.js');
const fancyNames = new Map([
    ['war', ' War'],
    ['pvp', ' PvP'],
    ['macgyver', ' MacGyver'],
    ['coldwar', ' ColdWar'],
    ['champion', ' Champion'],
    ['piracy', ' Piracy'],
    ['skirmish', ' Skirmish'],
    ['outlaw', 'n Outlaw'],
    ['apocalypse', 'n Apocalypse']
])

var lastUsed = 0
var lastUsedId = 0

module.exports = {
    name: "vote",
    aliases: ["vote"],
    description: "Request votes for a Scarlet Skies event.",
    options: [
        {
            name: "event",
            description: "The event this notification is about",
            type: "oneWordString",
            choices: ["war", "pvp", "macgyver", "coldwar", "champion", "piracy", "skirmish", "outlaw", "apocalypse"],
            required: true
        },
        {
            name: "message",
            description: "An optional message to include with the voting request",
            type: "string"
        }
    ],

    onRun: async (client, interaction, arguments, isTextCommand) => {
        if (interaction.guildId != 1059603807811682335 && interaction.guildId != 818267620821696563) { 
            await interaction.reply("This command can only be used in the Scarlet Skies discord server.");
            return;
        }
        if (interaction.user.id == lastUsedId) {
            await interaction.reply("This command can't be used by the person who sent the last vote request.");
            return;
        }
        if (interaction.member.roles.cache.some(role => role.name === "Voting Banned")) {
            await interaction.reply("You don't have permission to use this command.");
            return;
        }
        if (lastUsed + GLOBAL_CD > Date.now()) {
            await interaction.reply("This command is on cooldown! It can be used again 30 minutes after the last vote request (<t:" + Math.floor((lastUsed + GLOBAL_CD)/1000)  + ":R>)");
        } else {
            lastUsed = Date.now();
            var user;
            if (isTextCommand) {
                user = interaction.author;
            } else {
                user = interaction.user;
            }
            const voting = interaction.guild.roles.cache.find(role => role.name == "Voting");
            const embed = new EmbedBuilder().setTitle("A" + fancyNames.get(arguments[0]) + " vote has started!")
                .setAuthor({ name: interaction.member.displayName + " (" + user.username + ")", iconURL: user.avatarURL() });
            if (arguments[1]) {
                embed.setDescription(arguments[1]);
            }
            interaction.guild.channels.cache.find(channel => channel.name === "event-voting").send({content: `${voting ? `${voting}` : "(Role not found. Any role with the name Voting will work.)"}\n`, embeds: [embed]});
            
            lastUsedId = interaction.user.id ?? interaction.author.id
            await interaction.reply("Message sent.");
        }
    }
};