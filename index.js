// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const say = require('say');

say.getInstalledVoices(console.log)
say.speak('Hello')

var VoiceObj = new ActiveXObject("SAPI.SpVoice");
VoiceObj.Speak("aint no way");

// Create a new client instance
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`); 
});

// Log in to Discord with your client's token
client.login(token);

client.on('messageCreate', async message => {
    if (message.content.startsWith('--ping')) {
        message.reply('hi')
    }
})