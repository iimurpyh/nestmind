console.log(require('discord.js').version)
// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const { token } = require('./config.json');
const getSlashCommand = require('./getSlashCommand.js');
const { exec } = require('child_process');

var fs = require("fs");

const PREFIX = "^"

// Create a new client instance
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
    
] });

client.commands = new Collection();

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`); 
});

var commands = {};

fs.readdirSync('./commands').forEach((filename) => {
    var obj = require('./commands/' + filename);
    obj.slashCommand = getSlashCommand(obj);
    client.commands.set(obj.name, obj);
    commands[obj.name] = obj;

});

// Log in to Discord with your client's token
client.login(token);

client.on(Events.MessageCreate, async message => {
    if (message.content.startsWith(PREFIX) == true) {
        let commandName = message.content.substring(1, message.content.indexOf(" "));
        for (var i in commands) {
            var cmd = commands[i];
            for (var e in cmd.aliases) {
                if (cmd.aliases[e] == commandName) {
                    try {
                        var arguments = [];
                        var pos = commandName.length+1;
                        for (var n in cmd.options) {
                            var option = cmd.options[n]
                            if (option.type == "oneWordString") {
                                var start = message.content.indexOf(" ", pos);
                                var end = message.content.indexOf(" ", start+1);
                                var str
                                if (end == -1) {
                                    if (start == -1) {
                                        continue;
                                    }
                                    str = message.content.substring(start+1);
                                } else {
                                    str = message.content.substring(start+1, end);
                                }
                                if (option.choices) {
                                    let result = option.choices.find(s => s.toLowerCase() == str.toLowerCase())
                                    if (result) {
                                        arguments.push(result);
                                    } else {
                                        if (message.replied || message.deferred) {
                                            await message.followUp({ content: 'Invalid argument for "' + option.name + '" field.', ephemeral: true });
                                        } else {
                                            await message.reply({ content: 'Invalid argument for "' + option.name + '" field.', ephemeral: true });
                                        }
                                        return;
                                    }
                                } else {
                                    arguments.push(str);
                                }
                                if (end >= 0) {
                                    pos = end+1;
                                } else {
                                    pos = -1;
                                }
                                
                            } else if (option.type == "string") {
                                if (pos >= 0) {
                                    arguments.push(message.content.substring(pos+1));
                                } else {
                                    arguments.push(" ");
                                }
                            }
                        }
                        await cmd.onRun(message.client, message, arguments, true);
                    } catch (error) {
                        console.error(error);
                        if (message.replied || message.deferred) {
                            await message.followUp({ content: 'There was an error while executing this command.', ephemeral: true });
                        } else {
                            await message.reply({ content: 'There was an error while executing this command.', ephemeral: true });
                        }
                    }
                }
            }
        }
    }
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.dir('Command not found.');
        return;
    }
    
    try {
        var arguments = [];
        for (var n in command.options) {
            var option = command.options[n]
            if (option.type == "oneWordString") {
                arguments.push(interaction.options.getString(option.name));
            } else if (option.type == "string") {
                arguments.push(interaction.options.getString(option.name));
            }
        }
        await command.onRun(interaction.client, interaction, arguments, false);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command.', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
		}
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    const commandName = interaction.customId.split(' ')[0];
    const command = interaction.client.commands.get(commandName);

    try {
        await command.onButton(client, interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error handling this button interaction.', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error handling this button interaction.', ephemeral: true });
		}
    }
});