const ACTION_ITEM = 'action-label';

export function codicon(name: string, actionItem = false): string {
  return `codicon codicon-${name}${actionItem ? ` ${ACTION_ITEM}` : ''}`;
}

export function codiconArray(name: string, actionItem = false): string[] {
  const array = ['codicon', `codicon-${name}`];
  if (actionItem) {
    array.push(ACTION_ITEM);
  }
  return array;
}
