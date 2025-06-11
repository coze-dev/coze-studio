import { useState } from 'react';

import type { Meta, StoryFn } from '@storybook/react';

import { EnhancedView, View, ViewGroup } from '@/components/view';
import { Button } from '@/components/button';

import { Banner } from '..';
import type { BannerProps } from '..';

const meta: Meta = {
  title: 'Components/Banner',
  component: Banner,
  argTypes: {
    type: {
      options: ['info', 'danger', 'warning', 'success'],
      control: { type: 'select' },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};
export default meta;

export const Default: StoryFn<BannerProps> = args => (
  <EnhancedView>
    <Banner description="coz banner" {...args} />
  </EnhancedView>
);

Default.args = {};

export const Type: StoryFn<BannerProps> = args => (
  <View prop="variant" value="type" justify="start">
    <div className="w-full mb-2">
      <Banner
        {...args}
        description={
          <div>
            Do not share your API key with others, or expose it in the browser
            or other client-side.
            <span className="coz-fg-hglt pl-2 cursor-pointer">Link</span>
          </div>
        }
      />
    </div>
    <div className="w-full mb-2">
      <Banner
        {...args}
        type="success"
        description={
          <div className="flex">
            <div>
              Do not share your API key with others, or expose it in the browser
              or other client-side.
              <span className="coz-fg-hglt pl-2 cursor-pointer">Link</span>
            </div>
            <div></div>
          </div>
        }
      />
    </div>
    <div className="w-full mb-2">
      <Banner
        {...args}
        type="warning"
        description={
          <div>
            Do not share your API key with others, or expose it in the browser
            or other client-side.
            <span className="coz-fg-hglt pl-2 cursor-pointer">Link</span>
          </div>
        }
      />
    </div>
    <div className="w-full mb-2">
      <Banner
        {...args}
        type="danger"
        description={
          <div>
            Do not share your API key with others, or expose it in the browser
            or other client-side.
            <span className="coz-fg-hglt pl-2 cursor-pointer">Link</span>
          </div>
        }
      />
    </div>
  </View>
);

Type.args = {
  fullMode: true,
};

export const Close: StoryFn<BannerProps> = args => {
  const [visible, setVisible] = useState(true);
  const changeVisible = () => {
    setVisible(!visible);
  };
  return (
    <ViewGroup>
      <View prop="closeIcon" value="true" justify="start">
        <div className="w-full mb-2">
          {visible ? (
            <Banner
              fullMode={true}
              description={
                <div>
                  Do not share your API key with others, or expose it in the
                  browser or other client-side.
                  <span
                    className="coz-fg-hglt pl-2 cursor-pointer"
                    onClick={changeVisible}
                  >
                    Don't Show Again
                  </span>
                </div>
              }
            />
          ) : null}
        </div>
      </View>
      <View prop="closeIcon" value="null" justify="start">
        <div className="w-full mb-2">
          {visible ? (
            <Banner
              fullMode={true}
              justify="center"
              closeIcon={null}
              description={
                <div className="flex w-full justify-between">
                  Do not share your API key with others, or expose it in the
                  browser or other client-side.
                  <span
                    className="coz-fg-hglt pl-2 cursor-pointer"
                    onClick={changeVisible}
                  >
                    Don't Show Again
                  </span>
                </div>
              }
            />
          ) : null}
        </div>
      </View>
    </ViewGroup>
  );
};

Close.args = {};

export const Card: StoryFn<BannerProps> = args => (
  <View prop="variant" value="card" justify="start">
    <div className="border border-solid coz-stroke-primary rounded w-480px p-20px">
      <Banner
        card={true}
        fullMode={false}
        title="Title"
        type="info"
        bordered={false}
        description={
          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
            <span className="text-brand-6 pl-2 cursor-pointer">
              Don't Show Again
            </span>
          </div>
        }
      >
        <div className="text-right px-12px my-12px">
          <Button color="hgltplus" size="default">
            No, thanks.
          </Button>
        </div>
      </Banner>
      <br />
    </div>
  </View>
);

Card.args = {};
