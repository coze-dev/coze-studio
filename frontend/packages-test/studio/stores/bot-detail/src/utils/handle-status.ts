import { type Branch, type Committer } from '@coze-arch/bot-api/developer_api';

import { useCollaborationStore } from '../store/collaboration';

interface HeaderStatusType {
  branch?: Branch;
  same_with_online?: boolean;
  committer?: Committer;
  commit_version?: string;
}

export function updateHeaderStatus(props: HeaderStatusType) {
  const { setCollaborationByImmer } = useCollaborationStore.getState();
  setCollaborationByImmer(store => {
    store.sameWithOnline = props.same_with_online ?? false;
    if (props.committer) {
      store.commit_time = props.committer.commit_time ?? '';
      store.committer_name = props.committer.name ?? '';
    }
    if (props.commit_version) {
      store.commit_version = props.commit_version;
      store.baseVersion = props.commit_version;
    }
    if (props.branch) {
      store.branch = props.branch;
    }
  });
}
