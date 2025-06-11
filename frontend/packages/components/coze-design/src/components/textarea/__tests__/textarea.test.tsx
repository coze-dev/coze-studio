import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { TextArea } from '../textarea';

describe('TextArea', () => {
  it('render correctly', () => {
    render(<TextArea />);
    expect(document.getElementsByClassName('coz-textarea')).toHaveLength(1);
    expect(document.getElementsByTagName('textarea')).toHaveLength(1);
  });

  it('test disabled', () => {
    render(<TextArea disabled={true} />);
    expect(document.getElementsByTagName('textarea')[0].disabled).toBe(true);
  });

  it('test loading', () => {
    render(<TextArea loading={true} />);
    expect(document.getElementsByTagName('textarea')[0].disabled).toBe(true);
    expect(document.getElementsByClassName('coz-loading')).toHaveLength(1);
    expect(
      document.getElementsByClassName('coz-textarea')[0].className,
    ).toContain('coz-textarea-with-prefix');
  });

  it('test suffix', () => {
    render(<TextArea suffix="suffix" />);
    expect(
      document.getElementsByClassName('coz-textarea')[0].className,
    ).toContain('coz-textarea-with-suffix');
    const suffix = document.getElementsByClassName('coz-textarea-suffix');
    expect(suffix).toHaveLength(1);
    expect(suffix[0].textContent).toBe('suffix');
  });
});
