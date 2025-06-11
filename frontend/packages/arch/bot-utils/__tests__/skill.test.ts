import { SkillKeyEnum } from '@coze-agent-ide/tool-config';

import { skillKeyToApiStatusKeyTransformer } from '../src/skill';

vi.stubGlobal('IS_DEV_MODE', false);

vi.mock('@coze-agent-ide/tool', () => ({
  SkillKeyEnum: {
    TEXT_TO_SPEECH: 'tts',
  },
}));

describe('skill', () => {
  test('skillKeyToApiStatusKeyTransformer', () => {
    const test = SkillKeyEnum.TEXT_TO_SPEECH;
    expect(skillKeyToApiStatusKeyTransformer(test)).equal(`${test}_tab_status`);
  });
});
