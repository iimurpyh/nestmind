console.log(require('discord.js').version)
// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const { token } = require('./config.json');
const getSlashCommand = require('./getSlashCommand.js');

var fs = require("fs");

const PREFIX = "^"

// Create a new client instance
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
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
        for (var i in commands) {
            var cmd = commands[i];
            for (var e in cmd.aliases) {
                if (message.content.startsWith(PREFIX + cmd.aliases[e]) == true) {
                    try {
                        await cmd.onRun(message.client, message);
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
        await command.onRun(interaction.client, interaction);
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
    console.log(commandName);
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