import { useState, type FC } from 'react';

import type { Meta, StoryFn } from '@storybook/react';

import { EnhancedView, View } from '@/components/view';
import { IconCozClockFill } from '@/components/icon';
import { Button } from '@/components/button';

import type { ToastProps } from '..';
import { Toast } from '..';

const TIME = 2;
const DELAY_TIME = 2000;

const meta: Meta = {
  title: 'Components/Toast',
  tags: ['autodocs'],
  component: Toast,
  argTypes: {
    type: {
      options: ['default', 'info', 'error', 'warning', 'success'],
      control: { type: 'select' },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};
export default meta;

export const Default: StoryFn<ToastProps> = args => (
  <EnhancedView>
    <Button
      onClick={() =>
        Toast.info({
          content: 'Hi, Toast!',
          duration: TIME,
          showClose: true,
          direction: 'ltr',
          icon: <IconCozClockFill className="coz-fg-color-brand" />,
        })
      }
    >
      Display Toast
    </Button>
  </EnhancedView>
);

Default.args = {};

export const Update: StoryFn<ToastProps> = args => (
  <View prop="varint" value="update">
    <Button
      onClick={() => {
        const id = 'toastid';
        Toast.info({ content: 'Update Content By Id', id });
        setTimeout(() => {
          Toast.success({ content: 'Id By Content Update', id });
        }, DELAY_TIME);
      }}
    >
      Update Content By Id
    </Button>
  </View>
);
Update.args = {};

const handleOnClick = (type: string) => {
  Toast[type]({
    content: 'Hi, Toast Hi!',
    duration: TIME,
    showClose: false,
    theme: 'light',
  });
};

export const Type: StoryFn<ToastProps> = args => (
  <View prop="varint" value="type">
    <div className="flex space-x-2">
      <Button onClick={() => handleOnClick('info')}>Info</Button>
      <Button color="green" onClick={() => handleOnClick('success')}>
        Success
      </Button>
      <Button color="yellow" onClick={() => handleOnClick('warning')}>
        Warning
      </Button>
      <Button color="red" onClick={() => handleOnClick('error')}>
        Error
      </Button>
      <Button color="highlight" onClick={() => handleOnClick('create')}>
        Create
      </Button>
    </div>
  </View>
);

Type.args = {};

const CloseTemplate: FC<ToastProps> = () => {
  const [toastId, setToastId] = useState<string | null>('');
  function show() {
    if (toastId) {
      return;
    }

    const id = Toast.info({
      content: 'Hi, Toast!',
      duration: 0,
      showClose: true,
      direction: 'ltr',
      onClose: destroy,
    });
    setToastId(id);
  }

  function hide() {
    if (toastId) {
      Toast.close(toastId);
      destroy();
    }
  }

  function destroy() {
    setToastId(null);
  }

  return (
    <View prop="varint" value="type">
      <div className="flex space-x-2">
        <Button color="primary" onClick={show}>
          Show Toast
        </Button>
        <Button color="red" onClick={hide}>
          Hide Toast
        </Button>
      </div>
    </View>
  );
};

export const WithClose = {
  render: CloseTemplate,
  args: {},
};
