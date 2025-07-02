import { type BotInputLengthConfig } from './type';

const CN_INPUT_LENGTH_CONFIG: BotInputLengthConfig = {
  botName: 20,
  botDescription: 500,
  onboarding: 300,
  onboardingSuggestion: 50,
  suggestionPrompt: 5000,
  projectName: 20,
  projectDescription: 500,
};

const OVERSEA_INPUT_LENGTH_CONFIG: BotInputLengthConfig = {
  botName: 40,
  botDescription: 800,
  onboarding: 800,
  onboardingSuggestion: 90,
  suggestionPrompt: 5000,
  projectName: 40,
  projectDescription: 800,
};

export const getBotInputLengthConfig = () =>
  IS_OVERSEA ? OVERSEA_INPUT_LENGTH_CONFIG : CN_INPUT_LENGTH_CONFIG;
