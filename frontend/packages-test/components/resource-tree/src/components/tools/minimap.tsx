import {
  FlowMinimapService,
  MinimapRender,
} from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/fixed-layout-editor';

export const Minimap = ({ visible }: { visible: boolean }) => {
  const minimapService = useService(FlowMinimapService);
  if (!visible) {
    return <></>;
  }
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '60px',
        width: '198px',
        zIndex: 99,
      }}
    >
      <MinimapRender
        service={minimapService}
        panelStyles={{}}
        containerStyles={{
          pointerEvents: 'auto',
          position: 'relative',
          top: 'unset',
          right: 'unset',
          bottom: 'unset',
          left: 'unset',
        }}
        inactiveStyle={{
          opacity: 1,
          scale: 1,
          translateX: 0,
          translateY: 0,
        }}
      />
    </div>
  );
};
