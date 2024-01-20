import { Client, Message, GatewayIntentBits, TextChannel } from 'discord.js';
import { Queue } from './queue';
import {
  AlertChannelId,
  AudioPlayerStatus,
  DiscordBotToken,
  JoinVoiceChannelWords,
  LeaveVoiceChannelWords,
  Replies,
  TargetChannels,
  ThisBotId,
} from './constants';
import {
  cleanseStringForVoiceVox,
  hasWordInMessage,
  identifyVoicePreset,
} from './voicevox';
import {
  AudioPlayer,
  StreamType,
  VoiceConnection,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice';
import { getVoiceData } from './voicevox';

export class DiscordService {
  private readonly discord = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });
  private readonly audioPlayer = new AudioPlayer();
  private jobQueue = new Queue();
  private joiningVoiceChannelConnection: VoiceConnection | null = null;

  isMessageMentionedToThisBot(message: Message) {
    return message.mentions.has(ThisBotId);
  }

  async startJobExecuteLoop() {
    while (true) {
      if (this.jobQueue.getLength() === 0) {
        await this.jobQueue.waitForEnqueue();
      }
      const job = this.jobQueue.dequeue();
      await job();
    }
  }

  /**
   * init data
   */
  async init() {
    const TOKEN = DiscordBotToken;
    await this.discord.login(TOKEN).catch((error) => {
      console.error(error);
      process.exit(1);
    });
    console.log(`logged in with token: ${TOKEN}`);
  }

  setHandlers() {
    this.discord.on('messageCreate', async (message) => {
      await this.switchByMessage(message);
    });
    this.discord.on('error', (error) => {
      console.error(error);
      process.exit(1);
    });
  }

  async destroy() {
    await this.discord.destroy();
  }

  /**
   * @param job
   */
  async generateAndSpeak(messageString: string) {
    try {
      const voicePreset = identifyVoicePreset(messageString);
      const cleansedMessage = cleanseStringForVoiceVox(messageString);
      const voiceData = await getVoiceData(cleansedMessage, voicePreset);
      const resource = createAudioResource(voiceData, {
        inputType: StreamType.Arbitrary,
      });
      // wait for audio player to be idle
      while (this.audioPlayer.state.status !== AudioPlayerStatus.Idle) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      this.audioPlayer.play(resource);
    } catch (error) {
      // send error message to error alert channel
      if (AlertChannelId !== '') {
        const channel = (await this.discord.channels.fetch(
          AlertChannelId
        )) as TextChannel;
        await channel.send(
          `${Replies.FailedToGenerateVoiceData}\n\`\`\`\n${error}\n\`\`\``
        );
      } else {
        console.error(error);
      }
    }
  }

  /**
   * @param message
   */
  async switchByMessage(message: Message) {
    if (message.guild == null || message.member == null) {
      return;
    }

    if (this.isMessageMentionedToThisBot(message)) {
      this.joinOrLeaveVoiceChannel(message);
    } else if (TargetChannels.includes(message.channel.id)) {
      if (this.joiningVoiceChannelConnection == null) {
        return;
      }
      const messageText = message.content;
      this.jobQueue.enqueue(() => this.generateAndSpeak(messageText));
    }
  }

  /**
   * @param message
   */
  async joinOrLeaveVoiceChannel(message: Message) {
    const messageText = message.content;
    if (hasWordInMessage(messageText, JoinVoiceChannelWords)) {
      const channel = message.member!.voice.channel;
      if (channel == null) {
        await message.reply(Replies.JoinVoiceChannelFirst);
        return;
      }
      this.joiningVoiceChannelConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      this.joiningVoiceChannelConnection.subscribe(this.audioPlayer);
    } else if (hasWordInMessage(messageText, LeaveVoiceChannelWords)) {
      if (this.joiningVoiceChannelConnection != null) {
        this.joiningVoiceChannelConnection.destroy();
        this.joiningVoiceChannelConnection = null;
      } else {
        await message.reply(Replies.JoinVoiceChannelFirst);
      }
    }
  }
}
