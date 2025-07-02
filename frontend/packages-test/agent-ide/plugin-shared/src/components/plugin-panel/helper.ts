interface ApiParam {
  name: string;
  input: {
    type: string;
    value: {
      type: string;
      content: string;
    };
  };
}

export const extractApiParams = (paramName: string, apiParams: ApiParam[]) => {
  const param = apiParams.find(item => item.name === paramName);
  return param?.input?.value?.content ?? '';
};
