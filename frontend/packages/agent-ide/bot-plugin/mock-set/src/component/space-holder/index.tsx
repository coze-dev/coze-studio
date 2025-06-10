export function SpaceHolder({
  height,
  width,
}: {
  height?: number;
  width?: number;
}) {
  return (
    <div style={{ width, height, display: width ? 'inline-block' : 'block' }} />
  );
}
