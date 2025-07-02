import React, { useRef } from 'react';

import { useScroll, useInViewport, useMount } from 'ahooks';
import { NodeExeStatus } from '@coze-arch/idl/workflow_api';

interface Props {
  onMount?: (rect?: DOMRect) => void;
}

const LogEndView = ({ onMount }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useMount(() => {
    onMount?.(ref.current?.getBoundingClientRect());
  });

  return <div ref={ref} />;
};

export default function useLogView() {
  const logNodeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<NodeExeStatus | undefined>(undefined);

  const [inputInViewport] = useInViewport(inputRef);
  const scroll = useScroll(logNodeRef);

  const updateRunStatus = (status?: NodeExeStatus) => {
    statusRef.current = status;
  };

  const scrollToInputEnd = (endViewRect?: DOMRect) => {
    const needScroll =
      !!statusRef.current &&
      [NodeExeStatus.Success, NodeExeStatus.Fail].includes(statusRef.current);

    if (!needScroll) {
      return;
    }

    const logNodeRect = logNodeRef.current?.getBoundingClientRect();
    const inView =
      endViewRect && logNodeRect && endViewRect?.bottom <= logNodeRect?.bottom;

    if (inView) {
      return;
    }

    const inputRect = inputRef.current?.getBoundingClientRect?.();
    const scrollHeight = inputRect?.height;

    if (scrollHeight && logNodeRef.current) {
      logNodeRef.current?.scrollTo?.({
        top: scrollHeight,
        behavior: 'smooth',
      });
    }

    statusRef.current = undefined;
  };

  return {
    showInputBorder: Boolean(scroll?.top && scroll?.top > 0 && inputInViewport),
    showOutputBorder: Boolean(
      scroll?.top && scroll?.top > 0 && !inputInViewport,
    ),
    updateRunStatus,
    logNodeRef,
    inputRef,
    logView: <LogEndView onMount={scrollToInputEnd} />,
  };
}
