import React from 'react';

import { get } from 'lodash-es';
import { type FlowNodeType } from '@flowgram-adapter/free-layout-editor';
import { type NodeData } from '@coze-workflow/nodes';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { IconCozQuestionMarkCircle } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';

export const HelpLinkButton = ({
  helpLink,
  nodeData,
  nodeType,
}: {
  helpLink: string | ((props: { apiName: string }) => string);
  nodeData: NodeData[keyof NodeData];
  nodeType: FlowNodeType;
}) => {
  const handleClick = () => {
    sendTeaEvent(EVENT_NAMES.workflow_test_run_click, {
      nodes_type: String(nodeType),
      action: 'click_doc',
    });
    const path =
      typeof helpLink === 'string'
        ? helpLink
        : helpLink({
            apiName: get(nodeData, 'apiName') || '',
          });
    window.open(path, '_blank');
  };
  return (
    <>
      <IconButton
        onClick={handleClick}
        icon={<IconCozQuestionMarkCircle />}
        size="default"
        color="secondary"
      />
    </>
  );
};
