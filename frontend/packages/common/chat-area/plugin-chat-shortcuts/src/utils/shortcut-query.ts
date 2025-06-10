// 根据template_query和components拼接query
export const getQueryFromTemplate = (
  templateQuery: string,
  values: Record<string, unknown>,
) => {
  let query = templateQuery;
  // 替换模板中的{{key}}为values中key对应的值
  Object.keys(values).forEach(key => {
    query = query.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
      values[key] as string,
    );
  });

  return query;
};
