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
        await interaction.reply('TTS is disabled for now.');
        return;
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
            let soundName = `tts-sound-${interaction.id}.ogg`;
            let soundPath = SPEECH_DIR + '/' + soundName;

            fs.writeFileSync(textPath, arguments[0]);

            let voice = ttsVoices[saveManager.getUserConfig(user.id, 'tts-voice')];

            let watcher = fs.watch(SPEECH_DIR, (eventType, filepath) => {
                // On file creation
                if (eventType === 'rename' && filepath === soundName) {
                    console.log('starting stream');
                    let resource = createAudioResource(tailingStream.createReadStream(soundPath), {
                        inputType: StreamType.Arbitrary
                    });
                    ttsPlayer.play(resource);
                    ttsPlayer.once('idle', () => {
                        fs.rmSync(textPath, {
                            force: true
                        });
                        fs.rmSync(soundPath, {
                            force: true
                        });
                    });
                    watcher.close();
                }
            });

            // pitch is -t, rate is -r
            exec(`RHVoice-test -p ${voice.speaker} -i ${textPath} -o ${soundPath}`, (err) => {
                if (err) {
                    throw new Error(err);
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