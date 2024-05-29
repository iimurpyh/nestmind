const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, StreamType  } = require('@discordjs/voice');
const { exec } = require('child_process');
const fs = require('node:fs');

const ttsPlayer = createAudioPlayer();


module.exports = {
    name: "tts",
    aliases: ["tts"],
    description: "Communicate message using text to speech in your current VC channel.",
    options: [
        {
            name: "message",
            description: "Message to speak.",
            type: "string"
        }
    ],

    onRun: async (client, interaction, arguments) => {
        if (!arguments[0]) {
            ttsPlayer.stop();
            return;
        }
        let vc = interaction.member.voice.channel; 
        if (vc) {
            console.log(vc.name);
            let connection = getVoiceConnection();
            if (!connection || connection.channel.id != vc.id) {
                connection = joinVoiceChannel({
                    channelId: vc.id,
                    guildId: vc.guild.id,
                    adapterCreator: vc.guild.voiceAdapterCreator,
                });


                connection.subscribe(ttsPlayer);
            }
            

            fs.writeFileSync("./tts-message.txt", arguments[0]);
            exec('RHVoice-test -i tts-message.txt -o tts-voice.ogg', (err) => {
                if (err) {
                    throw new Error(err);
                }

                let resource = createAudioResource(fs.createReadStream('./tts-voice.ogg', {
                    inputType: StreamType.OggOpus
                }));

                ttsPlayer.play(resource);
            });
        } else {
            await interaction.reply("You aren't in a voice channel.");
        }
    }
};