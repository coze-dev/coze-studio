import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

type IProps = SetterComponentProps<
  unknown,
  {
    nameLabel?: string;
    valueLabel?: string;
    nameWidth?: string;
  }
>;

const TriggerParameterTitleSetter = ({ options }: IProps) => {
  const { nameLabel, valueLabel, nameWidth } = options;

  return (
    <div className="flex flex-row">
      <div
        className="coz-fg-secondary"
        style={{
          width: nameWidth,
        }}
      >
        {nameLabel}
      </div>
      <div className="flex-1 coz-fg-secondary">{valueLabel}</div>
    </div>
  );
};

export const triggerParameterTitle = {
  key: 'TriggerParameterTitle',
  component: TriggerParameterTitleSetter,
};
