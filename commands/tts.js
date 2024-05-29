const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, StreamType  } = require('@discordjs/voice');
const { exec } = require('child_process');
const fs = require('node:fs');
const tailingStream = require('tailing-stream');
const ttsVoices = require('../tts/speech-voice-list.js');
const saveManager = require('../saveManager.js');

const SPEECH_DIR = './tts-message-files';
const DISCONNECT_TIME_MS = 1.5 * 60000
const ttsPlayer = createAudioPlayer();

let connectionTimeouts = new Map();

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

    onRun: async (client, interaction, arguments, isTextCommand, isPrefixInvoked) => {
        var user;
        if (isTextCommand) {
            user = interaction.author;
        } else {
            user = interaction.user;
        }
        
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

            let textPath = SPEECH_DIR + `/tts-message-${interaction.id}.txt`;
            let soundName = `/tts-sound-${interaction.id}.ogg`;
            let soundPath = SPEECH_DIR + soundName

            console.log(textPath);

            fs.writeFileSync(textPath, arguments[0]);

            let voice = ttsVoices[saveManager.getUserConfig(user.id, 'tts-voice')];

            // pitch is -t, rate is -r
            exec(`RHVoice-test -p ${voice.speaker} -i ${textPath} -o ${soundPath}`, (err) => {
                if (err) {
                    throw new Error(err);
                }

                fs.rmSync(textPath, {
                    force: true
                });
                fs.rmSync(soundPath, {
                    force: true
                });
            });

            let watcher = fs.watchFile(SPEECH_DIR, (eventType, filepath) => {
                console.log(filepath);
                // On file creation
                if (eventType == 'rename' && filepath === soundName) {
                    let resource = createAudioResource(tailingStream.createReadStream(soundPath), {
                        inputType: StreamType.OggOpus
                    });
                    ttsPlayer.play(resource);
                    watcher.close();
                }
            });
            

            if (connectionTimeouts[interaction.guildId]) {
                clearTimeout(connectionTimeouts[interaction.guildId]);
            }

            connectionTimeouts[interaction.guildId] = setTimeout(() => {connection.destroy(); connectionTimeouts[interaction.guildId] == null}, DISCONNECT_TIME_MS);
        } else if (!isPrefixInvoked) {
            await interaction.reply("You aren't in a voice channel.");
        }
    }
};