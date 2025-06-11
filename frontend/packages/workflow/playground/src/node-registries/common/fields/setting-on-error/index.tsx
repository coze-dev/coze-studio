import { SettingOnErrorField } from './setting-on-error-field';

export const SettingOnError = ({
  name = 'settingOnError',
  batchModePath = 'batchMode',
  outputsPath = 'outputs',
  noPadding = false,
}) => (
  <SettingOnErrorField
    name={name}
    batchModePath={batchModePath}
    outputsPath={outputsPath}
    noPadding={noPadding}
    hasFeedback={false}
  />
);
