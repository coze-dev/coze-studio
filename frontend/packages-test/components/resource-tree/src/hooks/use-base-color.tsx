import {
  ConstantKeys,
  FlowDocumentOptions,
  useService,
} from '@flowgram-adapter/fixed-layout-editor';

export const BASE_DEFAULT_COLOR = '#BBBFC4';
export const BASE_DEFAULT_ACTIVATED_COLOR = '#5147ff';

export function useBaseColor(): {
  baseColor: string;
  baseActivatedColor: string;
} {
  const options = useService<FlowDocumentOptions>(FlowDocumentOptions);
  return {
    baseColor:
      options.constants?.[ConstantKeys.BASE_COLOR] || BASE_DEFAULT_COLOR,
    baseActivatedColor:
      options.constants?.[ConstantKeys.BASE_ACTIVATED_COLOR] ||
      BASE_DEFAULT_ACTIVATED_COLOR,
  };
}

export const DEFAULT_LINE_ATTRS: React.SVGProps<SVGPathElement> = {
  stroke: BASE_DEFAULT_COLOR,
  fill: 'transparent',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
