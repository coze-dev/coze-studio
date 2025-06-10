import { type TreeNodeCustomData } from '@/components/variable-tree/type';

export const ParamChannel = (props: { value: TreeNodeCustomData }) => {
  const { value } = props;
  return value.effectiveChannelList?.length ? (
    <div className="coz-stroke-primary text-[14px] font-[500] leading-[20px]">
      {value.effectiveChannelList?.join(',') ?? '--'}
    </div>
  ) : null;
};
