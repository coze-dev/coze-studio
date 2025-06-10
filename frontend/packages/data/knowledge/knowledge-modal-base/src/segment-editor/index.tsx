/* eslint-disable @coze-arch/max-line-per-function */
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';

import DOMPurify from 'dompurify';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { type UploadProps } from '@coze-arch/bot-semi/Upload';
import { IconCozImage } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';

import {
  transSliceContentInput,
  transSliceContentInputWithSave,
  imageOnLoad,
  imageOnError,
} from '../utils';
import { useEditorContextMenu } from './use-context-menu';
import { CustomUpload, handleCustomUploadRequest } from './custom-upload';

import styles from './index.module.less';

export enum SegmentationMode {
  Inline = 0,
  External = 1,
}
export interface SegmentEditorProps {
  mode?: SegmentationMode;
  value?: string;
  // change回调
  onChange: (content: string) => void | Promise<void>;
  setUploading?: (v: boolean) => void;
  /**
   * 目前仅抖音分身不支持上传图片
   * @default true
   */
  enableImg?: boolean;
}
export interface ImageContainerProps {
  src: string;
  isUploading?: boolean;
}
export interface SegmentEditorMethods {
  updateContent: (v: string) => void;
}
function changeBeforeContent(newContent: string) {
  const style = document.createElement('style');
  document.head.appendChild(style);
  if (style && style.sheet) {
    style.sheet.insertRule(
      `.knowledge-segment-editor-content:empty::before { content: '${newContent}' !important; }`,
      0,
    );
  }
}

/**
 * 分片编辑，支持文本/图片/表格
 */
export const SegmentEditor = forwardRef<
  SegmentEditorMethods,
  SegmentEditorProps
>(
  (
    {
      value = '',
      mode = SegmentationMode.External,
      onChange,
      setUploading,
      enableImg = true,
    },
    ref,
  ) => {
    const [cursorPosition, setCursorPosition] = useState<Range>();
    const [content, setContent] = useState(value);
    const editorRef = useRef<HTMLDivElement>(null);

    const onBlur = () => {
      const range = window.getSelection();
      if (range) {
        setCursorPosition(range.getRangeAt(0));
      }
    };
    const fireChange = () => {
      if (editorRef.current) {
        onChange(transSliceContentInputWithSave(editorRef.current.innerHTML));
      }
    };
    const insertImg = ({ url = '', tosKey = '' }) => {
      const img = document.createElement('img');
      img.setAttribute('src', url);
      img.setAttribute('data-tos-key', tosKey);
      img.addEventListener('load', imageOnLoad);
      img.addEventListener('error', imageOnError);

      if (editorRef.current) {
        if (cursorPosition) {
          cursorPosition.insertNode(img);
        } else {
          editorRef?.current?.appendChild(img);
        }
        fireChange();
      }
    };

    const pasteText = (e: HTMLElementEventMap['paste']) => {
      // 阻止默认的粘贴行为
      e.preventDefault();

      // 获取剪贴板中的文本内容
      const text = e.clipboardData?.getData('text/plain');

      // 在你想要粘贴的位置插入文本内容
      document.execCommand('insertText', false, text);
    };
    const handleKeyDown = (e: HTMLElementEventMap['keydown']) => {
      // 这里需要调研下，现在太刀耕火种了，下面的处理方式非常原始且有针对性，场景稍有变化就不会正常运行了
      if (e.key === 'Backspace') {
        const selection = window.getSelection();
        if (selection) {
          const range = selection.getRangeAt(0);
          const container = range.commonAncestorContainer;
          const previousImg = range.startContainer.previousSibling; // 获取光标前面的节点
          if (container.nodeType === Node.ELEMENT_NODE) {
            // 删除到整行结束时，container 会变成 contenteditable 的容器，这个时候需按照 img 的行数进行删除
            if (
              container.childNodes[range.startOffset - 1]?.nodeName === 'IMG'
            ) {
              e.preventDefault();
              container.childNodes[range.startOffset - 1].remove();
              // 使用 DOM API 删除图片不会触发 <div contenteditable> 的 input 事件
              fireChange();
            }
          } else if (
            range.startOffset === 0 &&
            previousImg?.nodeName === 'IMG'
          ) {
            // 这里指 container 是 text node 时，offset 为 0 且上个元素是 img 时
            // 接口读来的数据直接是 img 标签
            e.preventDefault();
            previousImg.remove(); // 删除图片
            fireChange();
          }
        }
      }
    };
    const handleLoad = (_e: HTMLElementEventMap['load']) => {
      editorRef?.current?.focus();
    };
    useEffect(() => {
      if (editorRef.current) {
        changeBeforeContent(I18n.t('knowledge_insert_img_012'));

        editorRef.current?.addEventListener('paste', pasteText);
        editorRef.current?.addEventListener('keydown', handleKeyDown);
        editorRef.current?.addEventListener('load', handleLoad);
        const removeCommonListener = () => {
          editorRef.current?.removeEventListener('keydown', handleKeyDown);
          editorRef.current?.removeEventListener('load', handleLoad);
          editorRef.current?.removeEventListener('paste', pasteText);
        };
        const imgs = editorRef.current.getElementsByTagName('img');
        if (imgs) {
          for (const img of imgs) {
            img.addEventListener('load', imageOnLoad);
            img.addEventListener('error', imageOnError);
          }
          return () => {
            removeCommonListener();
            for (const img of imgs) {
              img.removeEventListener('load', imageOnLoad);
              img.removeEventListener('error', imageOnError);
            }
          };
        }
        return removeCommonListener;
      }
    }, [editorRef.current]);
    useImperativeHandle(ref, () => ({
      updateContent: (v: string) => {
        setContent(v);
      },
    }));

    const handleCustomRequest: UploadProps['customRequest'] = object => {
      handleCustomUploadRequest({
        object,
        options: {
          onBeforeUpload: () => {
            setUploading?.(true);
          },
          onFinally: () => {
            setUploading?.(false);
          },
          onFinish: data => {
            insertImg(data);
          },
        },
      });
    };

    useEffect(
      () => () => {
        setUploading?.(false);
      },
      [],
    );

    const { popoverNode, onContainerScroll, onContextMenu } =
      useEditorContextMenu({
        insertImg,
      });

    return (
      <div
        data-testid={KnowledgeE2e.SegmentEditor}
        className={`bot-segment-editor-wrapper ${
          styles['segment-editor-wrapper']
        } ${
          mode === SegmentationMode.Inline && styles['segment-editor-inline']
        }`}
      >
        {enableImg && mode === SegmentationMode.External ? (
          <CustomUpload customRequest={handleCustomRequest}>
            <div className={styles['upload-img-btn']}>
              <IconButton
                data-testid={KnowledgeE2e.SegmentEditorInsertImgBtn}
                icon={<IconCozImage className="text-14px" />}
                iconPosition="left"
              >
                {I18n.t('knowledge_insert_img_002')}
              </IconButton>
            </div>
          </CustomUpload>
        ) : null}

        <div
          className={`bot-segment-editor ${styles['segment-editor']}`}
          onScroll={onContainerScroll}
        >
          <div
            ref={editorRef}
            onContextMenu={e => {
              onContextMenu(e);
            }}
            className={`${styles['segment-editor-content']} knowledge-segment-editor-content`}
            contentEditable="true"
            onBlur={onBlur}
            onInput={() => {
              fireChange();
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(transSliceContentInput(content)),
            }}
            id="slice-view-editor"
          ></div>

          {popoverNode}

          {enableImg && mode === SegmentationMode.Inline ? (
            <CustomUpload customRequest={handleCustomRequest}>
              <div className={styles['inline-upload-content']}>
                <IconButton
                  data-testid={KnowledgeE2e.SegmentEditorInsertImgBtn}
                  icon={<IconCozImage className="text-14px" />}
                  iconPosition="left"
                  size="small"
                >
                  {I18n.t('knowledge_insert_img_002')}
                </IconButton>
              </div>
            </CustomUpload>
          ) : null}
        </div>
      </div>
    );
  },
);
