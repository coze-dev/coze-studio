export function transformOnInit(value) {
  if (!value) {
    return;
  }

  const { inputs = {}, nodeMeta, outputs } = value;

  return {
    nodeMeta,
    ...inputs,
    outputs,
  };
}

export function transformOnSubmit(value) {
  const { nodeMeta, outputs, ...inputs } = value;
  return {
    nodeMeta,
    inputs,
    outputs,
  };
}
