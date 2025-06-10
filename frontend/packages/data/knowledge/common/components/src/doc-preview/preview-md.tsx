import { useEffect, useState, useRef } from 'react';

import { Spin } from '@coze/coze-design';
// import { MdBoxLazy } from '@coze-arch/bot-md-box/lazy';

interface IPreviewMdProps {
  fileUrl: string;
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const PreviewMd = (props: IPreviewMdProps) => {
  const { fileUrl } = props;
  const [mdContent, setMdContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(fileUrl)
      .then(res => res.text())
      .then(text => {
        setLoading(false);
        setMdContent(text);
      });
  }, [fileUrl]);

  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    async function render() {
      if (ref.current) {
        for (
          let i = 0, len = mdContent.length;
          i < Math.ceil(len / 50_000);
          i++
        ) {
          await wait(10);
          ref.current.textContent += mdContent.slice(
            i * 50_000,
            (i + 1) * 50_000,
          );
        }
        ref.current.textContent = mdContent;
      }
    }

    render();
  }, [mdContent]);

  return (
    <div className="flex flex-col items-center w-full h-full flex-1 py-2 px-4">
      <Spin
        wrapperClassName="w-full h-full grow"
        spinning={loading}
        childStyle={{
          width: '100%',
          height: '100%',
          flexGrow: 1,
        }}
      >
        {mdContent ? (
          // <MdBoxLazy className="max-w-full" markDown={mdContent} />
          <div>
            <pre
              className="max-w-full overflow-auto whitespace-pre-wrap break-all text-[14px] leading-[22px]"
              ref={ref}
            >
              {/* {mdContent} */}
            </pre>
          </div>
        ) : null}
      </Spin>
    </div>
  );
};
