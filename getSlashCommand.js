const {SlashCommandBuilder} = require('discord.js');

function setData(option, data) {
    option.setName(data.name);
    option.setDescription(data.description);
    option.setRequired(true);
    if (data.choices) {
        var choices = []
        for (var e in data.choices) {
            var choice = data.choices[e];
            choices.push({name: choice, value: choice});
        }
        option.addChoices(...choices);
    }
    return option;
}

module.exports = (obj) => {
    var command = new SlashCommandBuilder()
        .setName(obj.name)
        .setDescription(obj.description);

    for (var i in obj.options) {
        var data = obj.options[i];
        console.log(data);
        if (data.type == 'oneWordString' || data.type == 'string') {
            command.addStringOption(option => setData(option, data));
        }
    }
    
    return command;
}

