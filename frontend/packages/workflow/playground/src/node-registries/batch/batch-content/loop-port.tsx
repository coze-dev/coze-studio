import { Port } from '@/components/node-render/node-render-new/fields/port';

export const BatchPort = () => (
  <>
    <Port
      id={'batch-output-to-function'}
      type="output"
      style={{
        position: 'absolute',
        width: 20,
        height: 20,
        right: 'unset',
        top: 'unset',
        bottom: 0,
        left: '50%',
        transform: 'translate(-50%, 50%)',
      }}
    />
    <Port
      id={'batch-output'}
      type="output"
      style={{
        position: 'absolute',
        right: '0',
      }}
    />
  </>
);
