import { Avatar } from '@coze/coze-design';

interface Props {
  src?: string;
}

export function Icon({ src }: Props) {
  return <Avatar className="w-[16px] h-[16px]" shape="square" src={src} />;
}
