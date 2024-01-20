export const DiscordBotToken = process.env['DISCORD_BOT_TOKEN'] ?? '';

export const AudioPlayerStatus = {
  Idle: 'idle',
  Playing: 'playing',
};

export const AlertChannelId = process.env['ALERT_CHANNEL_ID'] ?? '';
export const TargetChannels =
  process.env['YOMIAGE_TARGET_CHANNEL_IDS']
    ?.split(',')
    .map((str) => str.trim()) ?? [];

export const ThisBotId = process.env['BOT_CLIENT_ID'] ?? '';
export const JoinVoiceChannelWords = [
  'かもん',
  'カモン',
  'おいで',
  'きて',
  'こい',
];
export const LeaveVoiceChannelWords = [
  'ばいばい',
  'バイバイ',
  'じゃあの',
  'またね',
  'さよなら',
  'さいなら',
];

export const Replies = {
  JoinVoiceChannelFirst: '通話に参加してから呼ぶのだ',
  FailedToGenerateVoiceData: '音声合成に失敗したでござる',
};

export const IgnorePhraseRegex = [/(https?:\/\/[^\s]+)/];
export const ReplaceTextOrRegex: {
  target: string | RegExp;
  replaceTo: string;
}[] = [
  {
    target: 'w',
    replaceTo: 'わら',
  },
  {
    target: 'ｗ',
    replaceTo: 'わら',
  },
  {
    target: /\n/,
    replaceTo: ' ',
  },
];

export const VoicevoxApiURLBase = process.env['VOICEVOX_API_URL'] ?? '';

export const MaxVoiceMessageLength = 200;
export const OverLengthMessageSuffix = ' 以下略';

export const VoicePreset = {
  Normal: 'normal',
  Angry: 'angry',
  Whisper: 'whisper',
  Sing: 'sing',
  Robot: 'robot',
} as const;
export type VoicePreset = typeof VoicePreset[keyof typeof VoicePreset];

type VoiceParam = {
  speedScale: number;
  intonationScale: number;
  pitchScale: number;
};
type VoicePresetType = {
  [key in VoicePreset]: {
    speaker: number;
    voiceParam: VoiceParam;
  };
};
export const VoicePresets: VoicePresetType = {
  normal: {
    speaker: 3,
    voiceParam: {
      speedScale: 1.2,
      intonationScale: 1.3,
      pitchScale: 0,
    },
  },
  angry: {
    speaker: 7,
    voiceParam: {
      speedScale: 1.2,
      intonationScale: 0.85,
      pitchScale: -0.05,
    },
  },
  whisper: {
    speaker: 22,
    voiceParam: {
      speedScale: 1.1,
      intonationScale: 1.0,
      pitchScale: -0.05,
    },
  },
  sing: {
    speaker: 1,
    voiceParam: {
      speedScale: 1.2,
      intonationScale: 1.5,
      pitchScale: 0.02,
    },
  },
  robot: {
    speaker: 7,
    voiceParam: {
      speedScale: 1.0,
      intonationScale: 0,
      pitchScale: 0.02,
    },
  },
};
