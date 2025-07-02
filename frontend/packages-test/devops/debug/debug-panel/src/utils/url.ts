// 
export function windowOpen({ url, target }: { url: string; target?: string }) {
  const element = document.createElement('a');
  element.target = target || '_blank';
  element.href = url;
  element.click();
}
