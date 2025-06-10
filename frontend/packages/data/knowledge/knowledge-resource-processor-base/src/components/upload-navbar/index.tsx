import classNames from 'classnames';
import { getKnowledgeIDEQuery } from '@coze-data/knowledge-common-services';
import { useDataNavigate, useKnowledgeParams } from '@coze-data/knowledge-stores';
import { IconCozArrowLeft } from '@coze/coze-design/icons';
import { IconButton, Typography } from '@coze/coze-design';

interface UploadActionNavbarProps {
  title: string;
}

// 上传页面导航栏
export const UploadActionNavbar = ({ title }: UploadActionNavbarProps) => {
  const params = useKnowledgeParams();
  const resourceNavigate = useDataNavigate();

  // TODO: hzf biz的分化在Scene层维护
  const fromProject = params.biz === 'project';
  const handleBack = () => {
    const query = getKnowledgeIDEQuery() as Record<string, string>;
    resourceNavigate.toResource?.('knowledge', params.datasetID, query);
  };

  return (
    <div
      className={classNames(
        'flex items-center justify-between shrink-0 h-[56px] coz-fg-primary',
        fromProject ? 'px-[12px]' : '',
      )}
    >
      <div className="flex items-center">
        <IconButton
          color="secondary"
          icon={<IconCozArrowLeft className="text-[16px]" />}
          iconPosition="left"
          className="!p-[8px]"
          onClick={handleBack}
        ></IconButton>
        <Typography.Text fontSize="16px" weight={500} className="ml-[8px]">
          {title}
        </Typography.Text>
      </div>
    </div>
  );
};
