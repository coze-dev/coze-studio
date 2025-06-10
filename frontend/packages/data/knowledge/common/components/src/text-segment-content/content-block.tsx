import React, { useState, useEffect } from 'react';

import DOMPurify from 'dompurify';
import cls from 'classnames';
import { useRequest } from 'ahooks';
import { IconCozTrashCan } from '@coze/coze-design/icons';
import { IconButton, TextArea } from '@coze/coze-design';
import { CustomError } from '@coze-arch/bot-error';
import { KnowledgeApi } from '@coze-arch/bot-api';

export const Title = ({ title, id }: { title: string; id: string }) => (
  <div
    id={`segment-${id}`}
    className={cls('w-full text-[14px] font-[500] leading-[20px] coz-fg-plus')}
  >
    {title}
  </div>
);
export const Text = ({
  text,
  selected,
  id,
  sliceID,
  editable,
  onDeleteSlice,
}: {
  text: string;
  selected?: boolean;
  id: string;
  sliceID?: string;
  editable?: boolean;
  onDeleteSlice?: (sliceID: string) => void;
}) => {
  const [value, setValue] = useState(text);

  useEffect(() => {
    setValue(text);
  }, [text]);

  const { run: updateSlice, loading: updateLoading } = useRequest(
    async (sliceId: string, updateContent: string) => {
      if (!sliceId) {
        throw new CustomError('normal_error', 'missing slice_id');
      }
      await KnowledgeApi.UpdateSlice({
        slice_id: sliceId,
        raw_text: updateContent,
      });
      return updateContent;
    },
    {
      manual: true,
    },
  );
  const { run: deleteSlice } = useRequest(
    async (sliceId: string) => {
      if (!sliceId) {
        throw new CustomError('normal_error', 'missing slice_id');
      }
      await KnowledgeApi.DeleteSlice({
        slice_ids: [sliceId],
      });
    },
    {
      manual: true,
      onSuccess: data => {
        if (onDeleteSlice && sliceID) {
          onDeleteSlice(sliceID);
        }
      },
    },
  );

  const [edit, setEdit] = useState(false);

  return (
    <div id={`segment-${id}`} className="relative group">
      {edit ? (
        <TextArea
          loading={updateLoading}
          readonly={!editable}
          className={cls(
            'flex items-center relative',
            'w-full p-2 !coz-mg-secondary',
            'border border-solid coz-stroke-primary rounded-[8px]',
            !editable &&
              '[&>*]:!coz-fg-primary !coz-mg-secondary !coz-stroke-primary',
          )}
          wrapperClassName={cls('rounded-[8px]', selected && '!coz-mg-hglt')}
          value={value}
          onChange={v => {
            setValue(v);
          }}
          onBlur={() => {
            setEdit(false);
            if (editable && sliceID && value !== text) {
              updateSlice(sliceID, value);
            }
          }}
          autosize
          autoFocus
          rows={1}
        ></TextArea>
      ) : (
        <pre
          className={cls(
            'block flex items-center relative',
            'w-full p-2 px-[12px] !coz-mg-secondary',
            'border border-solid coz-stroke-primary rounded-[8px]',
            'coz-fg-primary text-[14px] leading-[22px] my-0',
            'break-words',
            selected && '!coz-mg-hglt',
            'cursor-pointer',
          )}
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'break-spaces',
            display: 'block',
          }}
          onClick={() => {
            if (editable) {
              setEdit(true);
            }
          }}
        >
          {value}
        </pre>
      )}

      {editable ? (
        <IconButton
          className={cls(
            'absolute right-1 top-1',
            'coz-fg-secondary',
            'invisible group-hover:visible',
            'cursor-pointer',
          )}
          size="mini"
          icon={<IconCozTrashCan />}
          onClick={() => {
            deleteSlice(sliceID ?? '');
          }}
        />
      ) : null}
    </div>
  );
};
export const Image = ({
  base64,
  htmlText,
  link,
  id,
  caption,
  selected,
}: {
  base64?: string;
  htmlText?: string;
  link?: string;
  caption?: string;
  id: string;
  selected?: boolean;
}) => (
  <div
    id={`segment-${id}`}
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

export const Table = ({
  tableData,
  id,
  selected,
}: {
  tableData: string;
  id: string;
  selected?: boolean;
}) => (
  <div
    id={`segment-${id}`}
    className={cls(
      'flex items-center',
      'w-full p-2 coz-mg-secondary',
      'border border-solid coz-stroke-primary rounded-[8px]',
      selected && '!coz-mg-hglt',
    )}
  >
    <div
      className="w-full h-full overflow-auto"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tableData) }}
    />
  </div>
);
