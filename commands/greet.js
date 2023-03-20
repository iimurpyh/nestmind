module.exports = {
    name: "greet",
    aliases: ["greet", "hi"],
    description: "Replies with greeting",
    options: [],

    onRun: async (client, message) => {
        message.reply('hi')
    }
};