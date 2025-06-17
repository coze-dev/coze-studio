import { IconCozPauseFill, IconCozVolume } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';
import { useAudioPlayer } from '@coze-workflow/resources-adapter';

interface VoicePlayerProps {
  preview?: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ preview }) => {
  const { isPlaying, togglePlayPause } = useAudioPlayer(preview);

  return (
    <IconButton
      disabled={!preview}
      onClick={e => {
        e.stopPropagation();
        togglePlayPause();
      }}
      icon={isPlaying ? <IconCozPauseFill /> : <IconCozVolume />}
      size="small"
      color="secondary"
    />
  );
};
