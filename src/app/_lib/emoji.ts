import * as emojiRegexLib from 'emoji-regex';

export const emojiRegex = emojiRegexLib.default();

const singleEmojiRegex = new RegExp(`^(${emojiRegex.source})$`);

export const hasOnlyOneEmoji = (text: string) => singleEmojiRegex.test(text.trim());
