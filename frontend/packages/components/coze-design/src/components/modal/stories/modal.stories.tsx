/* eslint-disable max-lines */
import React, { useState } from 'react';

import { type StoryFn, type Meta } from '@storybook/react';

import { IconCozLoading } from '@/components/icon';
import {
  Button,
  type ButtonProps,
  type ButtonColor,
} from '@/components/button';

import { Modal, type ModalProps } from '..';
const meta: Meta = {
  title: 'Components/Modal',
  tags: ['autodocs'],
  component: Modal,
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const Default: StoryFn<ModalProps> = function DefaultFactory(args) {
  const [visible, setVisible] = useState<{ [k: string]: boolean }>({});
  return (
    <>
      <Button
        onClick={() => {
          setVisible({ ...visible, modal: !visible.modal });
        }}
      >
        open modal
      </Button>

      <Button
        className="ml-2"
        onClick={() => {
          setVisible({ ...visible, dialog: !visible.dialog });
        }}
      >
        open dialog
      </Button>
      {[
        {
          type: 'modal',
        },
        {
          type: 'dialog',
        },
      ].map(d => (
        <Modal
          {...args}
          closeOnEsc
          type={d.type as ModalProps['type']}
          title="Delete this bot?"
          visible={visible[d.type]}
          linearGradientMask={false}
          onOk={() => {
            console.log('Ok button click');
            setVisible({ ...visible, [d.type]: false });
          }}
          onCancel={() => {
            console.log('Cancel button click');
            setVisible({ ...visible, [d.type]: false });
          }}
          afterClose={() => {
            console.log('After close callback executed');
          }}
          cancelText="Cancel"
          okText="Delete"
        >
          This operation will not be reversed
        </Modal>
      ))}
    </>
  );
};

export const AutoLoading: StoryFn<ModalProps> = function DefaultFactory(args) {
  const [visible, setVisible] = useState<{ [k: string]: boolean }>({});
  return (
    <>
      <Button
        onClick={() => {
          setVisible({ ...visible, modal: !visible.modal });
        }}
      >
        operate modal
      </Button>

      <Button
        className="ml-2"
        onClick={() => {
          setVisible({ ...visible, dialog: !visible.dialog });
        }}
      >
        operate dialog
      </Button>
      {[
        {
          type: 'modal',
        },
        {
          type: 'dialog',
        },
      ].map(d => (
        <Modal
          {...args}
          closeOnEsc
          type={d.type as ModalProps['type']}
          title="Delete this bot?"
          visible={visible[d.type]}
          linearGradientMask={false}
          autoLoading={true}
          onOk={() =>
            delay(2000).then(() => {
              console.log('Ok button click');
              setVisible({ ...visible, [d.type]: false });
            })
          }
          onCancel={() =>
            delay(2000).then(() => {
              console.log('Cancel button click');
              setVisible({ ...visible, [d.type]: false });
            })
          }
          afterClose={() => {
            console.log('After close callback executed');
          }}
          cancelText="Cancel"
          okText="Delete"
        >
          This operation will be add loading auto;
        </Modal>
      ))}
    </>
  );
};

export const ModalSize: StoryFn<ModalProps> = function SizeFactory(args) {
  const [visible, setVisible] = useState<{ [k: string]: boolean }>({});
  return (
    <>
      {['default', 'large', 'xl', 'xxl', 'fill'].map(size => (
        <>
          <Button
            className="mr-2"
            onClick={() => {
              setVisible({ ...visible, [size]: !visible[size] });
            }}
          >
            open modal {size}
          </Button>
          <Modal
            {...args}
            closeOnEsc
            size={size as ModalProps['size']}
            type="modal"
            title="Delete this bot?"
            visible={visible[size]}
            onOk={() => {
              setVisible({ ...visible, [size]: false });
            }}
            onCancel={() => setVisible({ ...visible, [size]: false })}
            cancelText="Cancel"
            okText="Delete"
          >
            This operation will not be reversed
          </Modal>
        </>
      ))}
    </>
  );
};

export const ModalHeight: StoryFn<ModalProps> = function SizeFactory(args) {
  const [visible, setVisible] = useState<{ [k: string]: boolean }>({});
  const [innerHeight, setInnerHeight] = useState(100);
  return (
    <>
      {[
        {
          height: 'fit-content',
          content: (
            <div
              className="w-full  bg-white-3"
              style={{
                height: innerHeight,
              }}
            >
              <Button
                onClick={() => {
                  setInnerHeight(innerHeight + 100);
                }}
              >
                +
              </Button>
              <Button
                onClick={() => {
                  setInnerHeight(innerHeight - 100);
                }}
              >
                -
              </Button>
            </div>
          ),
        },
        {
          height: 'fill',
          content: <div className="w-full h-[2000px] bg-white-3"></div>,
        },
        {
          height: 600,
          content: <div className="w-full h-[2000px] bg-white-3"></div>,
        },
        {
          height: 400,
          content: <div className="w-full h-[2000px] bg-white-3"></div>,
        },
      ].map(({ height, content }) => (
        <>
          <Button
            className="mr-2"
            onClick={() => {
              setVisible({ ...visible, [`${height}`]: !visible[`${height}`] });
            }}
          >
            open modal {`${height}`}
          </Button>
          <Modal
            {...args}
            closeOnEsc
            type="modal"
            title="Delete this bot?"
            hasScroll={true}
            visible={visible[`${height}`]}
            height={height as ModalProps['height']}
            onOk={() => {
              setVisible({ ...visible, [`${height}`]: false });
            }}
            onCancel={() => setVisible({ ...visible, [`${height}`]: false })}
            cancelText="Cancel"
            okText="Delete"
          >
            {content ?? 'This operation will not be reversed'}
          </Modal>
        </>
      ))}
    </>
  );
};

export const FooterFill: StoryFn<ModalProps> = function FooterFillFactory(
  args,
) {
  const [visible, setVisible] = useState<{ [k: string]: boolean }>({});
  return (
    <>
      <Button
        onClick={() => {
          setVisible({ ...visible, modal: !visible.modal });
        }}
      >
        open modal
      </Button>

      <Button
        className="ml-2"
        onClick={() => {
          setVisible({ ...visible, dialog: !visible.dialog });
        }}
      >
        open dialog
      </Button>
      {[
        {
          type: 'modal',
        },
        {
          type: 'dialog',
        },
      ].map(d => (
        <Modal
          {...args}
          closeOnEsc
          footerFill
          type={d.type as ModalProps['type']}
          title="Delete this bot?"
          visible={visible[d.type]}
          onOk={() => {
            console.log('Ok button click');
            setVisible({ ...visible, [d.type]: false });
          }}
          onCancel={() => {
            console.log('Cancel button click');
            setVisible({ ...visible, [d.type]: false });
          }}
          afterClose={() => {
            console.log('After close callback executed');
          }}
          cancelText="Cancel"
          okText="Delete"
        >
          This operation will not be reversed
        </Modal>
      ))}
    </>
  );
};

export const Loading: StoryFn<ModalProps> = function LoadingFactory(args) {
  const [visible, setVisible] = useState<{ [k: string]: boolean }>({});
  return (
    <>
      <Button
        onClick={() => {
          setVisible({ ...visible, modal: !visible.modal });
        }}
      >
        open modal
      </Button>

      <Button
        className="ml-2"
        onClick={() => {
          setVisible({ ...visible, dialog: !visible.dialog });
        }}
      >
        open dialog
      </Button>
      {[
        {
          type: 'modal',
        },
        {
          type: 'dialog',
        },
      ].map(d => (
        <Modal
          {...args}
          closeOnEsc
          footerFill
          type={d.type as ModalProps['type']}
          title="Delete this bot?"
          visible={visible[d.type]}
          onOk={() => {
            console.log('Ok button click');
            setVisible({ ...visible, [d.type]: false });
          }}
          onCancel={() => {
            console.log('Cancel button click');
            setVisible({ ...visible, [d.type]: false });
          }}
          afterClose={() => {
            console.log('After close callback executed');
          }}
          cancelText="Cancel"
          okText="Delete"
          confirmLoading
          cancelLoading
        >
          This operation will not be reversed
        </Modal>
      ))}
    </>
  );
};

export const Color: StoryFn<ModalProps> = function ColorFactory(args) {
  const [visible, setVisible] = useState<{ [k: string]: boolean }>({});
  const colors = ['brand', 'yellow', 'red'];
  const types = ['modal', 'dialog'];
  const keys: string[] = [];
  types.forEach(type => {
    colors.forEach(color => {
      keys.push(`${type}-${color}`);
    });
  });
  return (
    <>
      {keys.map(key => {
        const [type, color] = key.split('-');
        return (
          <>
            <Button
              className="mr-2"
              onClick={() => {
                setVisible({
                  ...visible,
                  [key]: !visible[key],
                });
              }}
              color={color as ButtonProps['color']}
            >
              {color}-{type}
            </Button>
            <Modal
              {...args}
              title="Delete this bot?"
              type={type as ModalProps['type']}
              visible={visible[key]}
              onOk={() => {
                setVisible({
                  ...visible,
                  [key]: !visible[key],
                });
              }}
              onCancel={() => {
                setVisible({
                  ...visible,
                  [key]: !visible[key],
                });
              }}
              closeOnEsc={true}
              cancelText="Cancel"
              okText="Delete"
              okButtonColor={color as ButtonProps['color']}
            >
              This operation will not be reversed
            </Modal>
          </>
        );
      })}
    </>
  );
};

export const CustomChildren: StoryFn<ModalProps> =
  function CustomChildrenFactory(args) {
    const [visible, setVisible] = useState({});
    const contents = [
      {
        name: 'null',
        content: null,
      },
      {
        name: 'String',
        content: 'I`m string equal <Content />',
      },
      {
        name: 'Content',
        content: <Modal.Content>I`m Content Component</Modal.Content>,
      },
      {
        name: 'Custom',
        content: (
          <>
            <Modal.SubTitle>subtitle1</Modal.SubTitle>
            <Modal.Description>description1</Modal.Description>
            <Modal.SubTitle>subtitle2</Modal.SubTitle>
            <Modal.Description>description2</Modal.Description>
            <Modal.SubTitle>subtitle1</Modal.SubTitle>
            <Modal.Description>description1</Modal.Description>
          </>
        ),
      },
    ];
    const types = ['modal', 'dialog'];
    const keys: string[] = [];
    types.forEach(type => {
      contents.forEach(content => {
        keys.push(`${type}-${content.name}`);
      });
    });
    return (
      <>
        {keys.map(key => {
          const [type, contentName] = key.split('-');
          return (
            <>
              <Button
                className="mr-2 mb-2"
                onClick={() => {
                  setVisible({
                    ...visible,
                    [key]: !visible[key],
                  });
                }}
              >
                {key}
              </Button>
              <Modal
                {...args}
                title="Delete this bot?"
                type={type as ModalProps['type']}
                visible={visible[key]}
                onOk={() => {
                  setVisible({
                    ...visible,
                    [key]: !visible[key],
                  });
                }}
                onCancel={() => {
                  setVisible({
                    ...visible,
                    [key]: !visible[key],
                  });
                }}
                closeOnEsc={true}
                cancelText="Cancel"
                okText="Delete"
              >
                {contents.find(c => c.name === contentName)?.content}
              </Modal>
            </>
          );
        })}
      </>
    );
  };

export const LongText: StoryFn<ModalProps> = function CustomChildrenFactory(
  args,
) {
  const [visible, setVisible] = useState<{ [k: string]: boolean }>({});
  const texts = [
    {
      title:
        'I`m very long title I`m very long title I`m very long title I`m very long title',
      content:
        'I`m very long text I`m very long text I`m very long text I`m very long text I`m very long text I`m very long text I`m very long text I`m very long text I`m very long text I`m very long text I`m very long text I`m very long text I`m very long text I`m very long text I`m very long text I`m',
    },
  ];
  const types = ['modal', 'dialog'];
  const keys: string[] = [];
  types.forEach(type => {
    texts.forEach(text => {
      keys.push(`${type}-${text.title}`);
    });
  });
  return (
    <>
      {keys.map(key => {
        const [type, textTitle] = key.split('-');
        return (
          <>
            <Button
              className="mr-2 mb-2"
              onClick={() => {
                setVisible({
                  ...visible,
                  [key]: !visible[key],
                });
              }}
            >
              {type}
            </Button>
            <Modal
              {...args}
              title={textTitle}
              type={type as ModalProps['type']}
              visible={visible[key]}
              onOk={() => {
                setVisible({
                  ...visible,
                  [key]: !visible[key],
                });
              }}
              onCancel={() => {
                setVisible({
                  ...visible,
                  [key]: !visible[key],
                });
              }}
              closeOnEsc={true}
              cancelText="Cancel"
              okText="Delete"
            >
              {texts.find(t => t.title === textTitle)?.content}
            </Modal>
          </>
        );
      })}
    </>
  );
};

export const Order: StoryFn<ModalProps> = function OrderFactory(args) {
  return (
    <div className="flex gap-2">
      {[
        {
          title: 'This is a success message',
          content: 'bla bla bla...',
          fn: 'success',
          buttonColor: 'brand',
        },
        {
          title: 'Here is some info',
          content: 'bla bla bla...',
          fn: 'info',
          buttonColor: 'brand',
        },
        {
          title: 'Unfortunately, there is an error',
          content: 'bla bla bla...',
          fn: 'error',
          buttonColor: 'red',
        },
        {
          title: 'Warning: be cautious ahead',
          content: 'bla bla bla...',
          fn: 'warning',
          buttonColor: 'yellow',
        },
        {
          title: 'Are you sure?',
          content: 'bla bla bla...',
          fn: 'confirm',
          buttonColor: 'brand',
        },
        {
          title: 'This is a custom modal',
          content: 'bla bla bla...',
          fn: 'info',
          name: 'custom',
          icon: (
            <div className="text-red">
              <IconCozLoading />
            </div>
          ),
          buttonColor: 'brand',
        },
      ].map(({ name, fn, buttonColor, ...rest }) => (
        <Button
          onClick={() => {
            const options: ModalProps = {
              ...rest,
              cancelText: 'Cancel',
              okText: 'Delete',
              type: 'dialog',
            };
            Modal[fn](options);
          }}
          color={buttonColor as ButtonColor}
        >
          {name ?? fn}(dialog)
        </Button>
      ))}
      <div>
        <Button
          onClick={() => {
            const options: ModalProps = {
              title: 'dialog',
              cancelText: 'Cancel',
              okText: 'Delete',
              type: 'dialog',
              autoLoading: true,
              content: 'hello content',
              onOk: async () => {
                await delay(2000);
                console.log('Ok button click');
              },
              onCancel: async () => {
                await delay(2000);
                console.log('Ok button cancel');
              },
            };
            Modal.error(options);
          }}
          color="red"
        >
          Dialog Async
        </Button>
      </div>
    </div>
  );
};
