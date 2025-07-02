import '@testing-library/jest-dom/vitest';
vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(),
  },
}));
vi.mock('@coze-arch/coze-design', () => ({
  Typography: {
    Text: vi.fn(props => <span>{props.children}</span>),
  },
  Tag: vi.fn(props => <span>{props.children}</span>),
  Tooltip: vi.fn(props => (
    <span data-content={props.content}>{props.children}</span>
  )),
  Collapsible: vi.fn(props =>
    props.isOpen ? <span>{props.children}</span> : null,
  ),
}));
vi.mock('ahooks', () => ({
  useInViewport: vi.fn(() => [true]),
}));

vi.stubGlobal('IS_DEV_MODE', true);
vi.stubGlobal('IS_OVERSEA', false);
vi.stubGlobal('IS_BOE', false);
vi.stubGlobal('REGION', 'cn');
