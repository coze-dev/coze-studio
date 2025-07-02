export interface SubCanvasRenderProps {
  title: string;
  tooltip?: string;
  renderPorts: {
    id: string;
    type: 'input' | 'output';
    style: React.CSSProperties;
  }[];
  style: React.CSSProperties;
}
