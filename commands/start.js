const GLOBAL_CD = 3600 * 1000;
const { EmbedBuilder } = require('discord.js');
const fancyNames = new Map([
    ['war', 'War'],
    ['pvp', 'PvP'],
    ['macgyver', 'MacGyver'],
    ['coldwar', 'ColdWar'],
    ['champion', 'Champion'],
    ['piracy', 'Piracy'],
    ['tycoon', 'Tycoon'],
    ['outlaw', 'Outlaw']
])

var lastUsed = 0

module.exports = {
    name: "start",
    aliases: ["start"],
    description: "Notify people of the start of a Scarlet Skies event. Don't use this if an event hasn't started.",
    options: [
        {
            name: "event",
            description: "The event this notification is about",
            type: "oneWordString",
            choices: ["war", "pvp", "macgyver", "coldwar", "champion", "piracy", "tycoon", "outlaw"],
            required: true
        },
        {
            name: "message",
            description: "An optional message to include with the notification",
            type: "string"
        }
    ],

    onRun: async (client, interaction, arguments, isTextCommand) => {
        if (interaction.guildId != 1059603807811682335 && interaction.guildId != 818267620821696563) { 
            await interaction.reply("This command can only be used in the Scarlet Skies discord server.");
            return;
        }
        if (interaction.member.roles.cache.some(role => role.name === "Voting Banned")) {
            await interaction.reply("You don't have permission to use this command.");
            return;
        }
        if (lastUsed + GLOBAL_CD > Date.now()) {
            await interaction.reply("This command is on cooldown! It can be used again an hour after the last notification (<t:" + Math.floor((lastUsed + GLOBAL_CD)/1000)  + ":R>)");
        } else {
            lastUsed = Date.now();
            var user;
            if (isTextCommand) {
                user = interaction.author;
            } else {
                user = interaction.user;
            }
            const events = interaction.guild.roles.cache.find(role => role.name == "Events");
            const embed = new EmbedBuilder().setTitle(fancyNames.get(arguments[0]) + " has begun!")
                .setAuthor({ name: interaction.member.displayName + " (" + user.username + ")", iconURL: user.avatarURL() });
            if (arguments[1]) {
                embed.setDescription(arguments[1]);
            }
            embed.setFooter({text: "If this event hasn't actually been voted, contact a server moderator"});
            interaction.guild.channels.cache.find(channel => channel.name === "event-voting").send({content: `${events ? `${events}` : "(Role not found. Any role with the name Events will work.)"}\n`, embeds: [embed]});
            await interaction.reply("Message sent.");
        }
    }
};