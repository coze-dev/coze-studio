import { type Meta, type StoryFn } from '@storybook/react';
import { Table } from '@douyinfe/semi-ui';

import { ViewGroup, View } from '@/components/view';

import {
  fgThemes,
  fgFunctionals,
  fgChart,
  fgCode,
  fgBranding,
  mgThemes,
  mgFunctional,
  mgCard,
  bgThemes,
  strokeThemes,
  shadowThemes,
} from '../tokens';
import { strokeColumns } from '../stroke';
import { shadowColumns } from '../shadow';
import { mgColumns } from '../middleground';
import { fgColumns } from '../foreground';
import { bgColumns } from '../background';
import { Color } from '..';

const meta: Meta = {
  title: 'Colors/Token',
  component: Color,
  argTypes: {
    theme: {
      options: ['dark', 'light'],
      control: { type: 'select' },
    },
    isSemantic: {
      control: false,
    },
  },
};

export default meta;

export const Foreground: StoryFn = args => (
  <ViewGroup>
    <View prop="variant" value="theme">
      <Table
        size="default"
        columns={fgColumns}
        dataSource={fgThemes}
        pagination={false}
      />
    </View>
    <View prop="variant" value="functionals">
      <Table
        size="default"
        columns={fgColumns}
        dataSource={fgFunctionals}
        pagination={false}
      />
    </View>
    <View prop="variant" value="Chart&Tag">
      <Table
        size="default"
        columns={fgColumns}
        dataSource={fgChart}
        pagination={false}
      />
    </View>
    <View prop="variant" value="Code">
      <Table
        size="default"
        columns={fgColumns}
        dataSource={fgCode}
        pagination={false}
      />
    </View>
    <View prop="variant" value="Branding">
      <Table
        size="default"
        columns={fgColumns}
        dataSource={fgBranding}
        pagination={false}
      />
    </View>
    <div className="flex pb-5px" />
  </ViewGroup>
);

Foreground.args = {};

export const Middleground: StoryFn = args => (
  <ViewGroup>
    <View prop="variant" value="theme">
      <Table
        size="default"
        columns={mgColumns}
        dataSource={mgThemes}
        pagination={false}
      />
    </View>
    <View prop="variant" value="functional">
      <Table
        size="default"
        columns={mgColumns}
        dataSource={mgFunctional}
        pagination={false}
      />
    </View>
    <View prop="variant" value="card">
      <Table
        size="default"
        columns={mgColumns}
        dataSource={mgCard}
        pagination={false}
      />
    </View>
    <div className="flex pb-5px" />
  </ViewGroup>
);

Middleground.args = {};

export const Background: StoryFn = args => (
  <ViewGroup>
    <View prop="variant" value="theme">
      <Table
        size="default"
        columns={bgColumns}
        dataSource={bgThemes}
        pagination={false}
      />
    </View>
    <div className="flex pb-5px" />
  </ViewGroup>
);

Background.args = {};

export const Stroke: StoryFn = args => (
  <ViewGroup>
    <View prop="variant" value="theme">
      <Table
        size="default"
        columns={strokeColumns}
        dataSource={strokeThemes}
        pagination={false}
      />
    </View>
    <div className="flex pb-5px" />
  </ViewGroup>
);

export const Shadow: StoryFn = args => (
  <ViewGroup>
    <View prop="variant" value="theme">
      <Table
        size="default"
        columns={shadowColumns}
        dataSource={shadowThemes}
        pagination={false}
      />
    </View>
    <div className="flex pb-5px" />
  </ViewGroup>
);

Stroke.args = {};
