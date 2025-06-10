import { useBotSkillStore } from '../store/bot-skill';

export const useChatBackgroundState = () => {
  const backgroundState = useBotSkillStore(s => s.backgroundImageInfoList);

  const showBackground =
    !!backgroundState?.[0]?.mobile_background_image?.origin_image_url;
  const mobileBackGround =
    backgroundState?.[0]?.web_background_image?.origin_image_url;

  const pcBackground =
    backgroundState?.[0]?.web_background_image?.origin_image_url;

  return {
    showBackground,
    mobileBackGround,
    pcBackground,
    backgroundModeClassName: showBackground ? '!coz-fg-images-white' : '',
  };
};
