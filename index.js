"use strict";
exports.__esModule = true;
var dotenvx = require("dotenv-extended");
var discord_js_1 = require("discord.js");
var johnny_five_1 = require("johnny-five");
dotenvx.load();
var DiscordStatusLed = /** @class */ (function () {
    function DiscordStatusLed() {
        var _this = this;
        this.board = new johnny_five_1.Board();
        this.discordClient = new discord_js_1.Client();
        this.board.on('ready', function () {
            console.log('Board ready');
            _this.led = new johnny_five_1.Led(2);
            _this.updateLed();
        });
        this.discordClient.on('ready', function () {
            console.log('Discord client ready');
        });
        this.discordClient.on('voiceStateUpdate', function (oldMember, newMember) {
            if (newMember.user.id != process.env.DISCORD_USER_ID) {
                return;
            }
            _this.lastDiscordVoiceStatusMember = newMember;
            _this.updateLed();
        });
        this.discordClient.login(process.env.DISCORD_TOKEN);
    }
    DiscordStatusLed.prototype.updateLed = function () {
        if (!this.led || !this.lastDiscordVoiceStatusMember) {
            return;
        }
        var connectedToVoiceChannel = this.lastDiscordVoiceStatusMember.voiceChannelID != null;
        var muted = this.lastDiscordVoiceStatusMember.mute;
        var voiceActivated = connectedToVoiceChannel && !muted;
        if (voiceActivated) {
            this.led.on();
        }
        else {
            this.led.off();
        }
    };
    return DiscordStatusLed;
}());
new DiscordStatusLed();
