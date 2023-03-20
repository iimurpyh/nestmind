const {SlashCommandBuilder} = require('discord.js');

function setData(option, data) {
    option.setName(data.name);
    option.setDescription(data.description);
    option.setRequired(true);
    return option;
}

module.exports = (obj) => {
    var command = new SlashCommandBuilder()
        .setName(obj.name)
        .setDescription(obj.description);

    for (var i in obj.options) {
        var data = obj.options[i];
        console.log(data);
        if (data.type == 'oneWordString') {
            command.addStringOption(option => setData(option, data));
        }
    }
    
    return command;
}

