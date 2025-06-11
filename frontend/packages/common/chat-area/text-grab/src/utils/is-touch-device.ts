export function isTouchDevice(): boolean {
  return 'ontouchend' in document;
}
