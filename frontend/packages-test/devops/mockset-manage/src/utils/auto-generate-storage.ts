import { PluginMockDataGenerateMode } from '@coze-arch/bot-tea';

const LOCAL_STORAGE_KEY = 'mockset_auto_generate_latest_choice';

let latestAutoGenerationChoice = PluginMockDataGenerateMode.MANUAL;

async function getFromLocalStorage() {
  const info = await localStorage.getItem(LOCAL_STORAGE_KEY);
  if (Number(info) === PluginMockDataGenerateMode.LLM) {
    latestAutoGenerationChoice = PluginMockDataGenerateMode.LLM;
  } else {
    latestAutoGenerationChoice = PluginMockDataGenerateMode.RANDOM;
  }

  if (!info || Number.isNaN(Number(info))) {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      String(PluginMockDataGenerateMode.RANDOM),
    );
  }
  return latestAutoGenerationChoice;
}

export function getLatestAutoGenerationChoice() {
  if (latestAutoGenerationChoice === PluginMockDataGenerateMode.MANUAL) {
    return getFromLocalStorage();
  } else {
    return latestAutoGenerationChoice;
  }
}

export function setLatestAutoGenerationChoice(
  choice: PluginMockDataGenerateMode.RANDOM | PluginMockDataGenerateMode.LLM,
) {
  latestAutoGenerationChoice = choice;
  localStorage.setItem(LOCAL_STORAGE_KEY, String(choice));
}
