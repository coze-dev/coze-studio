interface MessageMethodsProps {
  refreshMessageList: () => void;
}
export const createMessageMethods = (params: MessageMethodsProps) => {
  const { refreshMessageList } = params;
  return {
    refreshMessageList,
  };
};
