import * as dotenvx from 'dotenv-extended';
import { Client as DiscordClient, GuildMember } from 'discord.js';
import { Board, Led } from 'johnny-five';

dotenvx.load();

class DiscordStatusLed {
    private board: Board;
    private discordClient: DiscordClient;

    private led?: Led;
    private lastDiscordVoiceStatusMember?: GuildMember;

    constructor() {
        this.board = new Board();
        this.discordClient = new DiscordClient();

        this.board.on('ready', () => {
            console.log('Board ready');
            this.led = new Led(2);

            this.updateLed();
        });

        this.discordClient.on('ready', () => {
            console.log('Discord client ready');
        });
        this.discordClient.on('voiceStateUpdate', (oldMember, newMember) => {
            if (newMember.user.id != process.env.DISCORD_USER_ID) { return; }

            this.lastDiscordVoiceStatusMember = newMember;
            this.updateLed();
        });

        this.discordClient.login(process.env.DISCORD_TOKEN);
    }

    private updateLed() {
        if (!this.led || !this.lastDiscordVoiceStatusMember) { return; }

        const connectedToVoiceChannel = this.lastDiscordVoiceStatusMember.voiceChannelID != null;
        const muted = this.lastDiscordVoiceStatusMember.mute;

        const voiceActivated = connectedToVoiceChannel && !muted;

        if (voiceActivated) {
            this.led.on();
        } else {
            this.led.off();
        }
    }
}

new DiscordStatusLed();
