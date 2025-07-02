import cls from 'classnames';

export const TitleChunkPreview = ({
  title,
  id,
}: {
  title: string;
  id: string;
}) => (
  <div
    id={id}
    className={cls('w-full text-[14px] font-[500] leading-[20px] coz-fg-plus')}
  >
    {title}
  </div>
);
