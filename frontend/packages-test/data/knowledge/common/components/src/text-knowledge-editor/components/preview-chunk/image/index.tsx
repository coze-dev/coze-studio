import DOMPurify from 'dompurify';
import cls from 'classnames';

export const ImageChunkPreview = ({
  base64,
  htmlText,
  link,
  caption,
  locateId,
  selected,
}: {
  base64?: string;
  htmlText?: string;
  link?: string;
  caption?: string;
  locateId: string;
  selected?: boolean;
}) => (
  <div
    id={locateId}
    className={cls(
      'flex items-center flex-col gap-2',
      'w-full p-2 coz-mg-secondary',
      'border border-solid coz-stroke-primary rounded-[8px]',
      selected && '!coz-mg-hglt',
    )}
  >
    {base64 ? (
      <img
        src={`data:image/jpeg;base64, ${base64}`}
        className="w-full h-full"
      />
    ) : null}
    {htmlText ? (
      <div
        className="w-full h-full overflow-auto [&>*]:w-full [&>*]:h-full"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlText) }}
      />
    ) : null}
    {link ? (
      <div className="coz-fg-primary text-[14px] leading-[20px] font-[400] break-all">
        {link}
      </div>
    ) : null}
    {caption ? (
      <div className="coz-fg-primary text-[14px] leading-[20px] font-[400] break-all">
        {caption}
      </div>
    ) : null}
  </div>
);
