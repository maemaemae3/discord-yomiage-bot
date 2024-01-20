import axios from 'axios';
import { Readable } from 'stream';
import { toHiragana } from "wanakana";
import {
  IgnorePhraseRegex,
  MaxVoiceMessageLength,
  OverLengthMessageSuffix,
  ReplaceTextOrRegex,
  VoicePresets,
  VoicePreset,
  VoicevoxApiURLBase,
} from './constants';

export const getVoiceData = async (
  text: string,
  voicePresetName: VoicePreset
) => {
  const voicePreset = VoicePresets[voicePresetName];
  const { data: voiceQuery } = await axios.post(
    `${VoicevoxApiURLBase}/audio_query?text=${text}&speaker=${voicePreset.speaker}`
  );
  const { data: voiceData } = await axios.post(
    `${VoicevoxApiURLBase}/synthesis?speaker=3`,
    { ...voiceQuery, ...voicePreset.voiceParam },
    {
      responseType: 'stream',
    }
  );

  return voiceData as Readable;
};

export const hasWordInMessage = (string: string, words: string[]) => {
  return words.some((word) => string.includes(word));
};

export const cleanseStringForVoiceVox = (string: string) => {
  for (const regex of IgnorePhraseRegex) {
    string = string.replace(new RegExp(regex, 'g'), '');
  }
  // convert to hiragana before replacing to specific words
  string = toHiragana(string);
  // replace words like 'w' to 'わら'
  for (const { target, replaceTo } of ReplaceTextOrRegex) {
    string = string.replace(new RegExp(target, 'g'), replaceTo);
  }
  // limit length
  if (string.length > MaxVoiceMessageLength) {
    string = string.slice(0, MaxVoiceMessageLength);
    string = string + OverLengthMessageSuffix;
  }
  console.error(string);
  return string;
};

export const identifyVoicePreset = (string: string) => {
  string = string.trim();
  if (string.endsWith('💢')) {
    return VoicePreset.Angry;
  }
  if (string.match(/^.+[♪|♫|♬]$/)) {
    return VoicePreset.Sing;
  }
  if (string.match(/^[\(|（].+[\)|）]$/)) {
    return VoicePreset.Whisper;
  }
  if (string.match(/^[ア-ンｱ-ﾝ]+$/)) {
    return VoicePreset.Robot;
  }
  return VoicePreset.Normal;
};
