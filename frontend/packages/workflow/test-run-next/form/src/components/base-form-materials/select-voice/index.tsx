import { VoiceSelect } from '@coze-workflow/components';

interface SelectVoiceProps {
  value?: string;
  onChange?: (v?: string) => void;
  onBlur?: () => void;
}

export const SelectVoice: React.FC<SelectVoiceProps> = ({
  onChange,
  onBlur,
  ...props
}) => {
  const handleChange = (v?: string) => {
    onChange?.(v);
    onBlur?.();
  };

  return <VoiceSelect onChange={handleChange} {...props} />;
};
