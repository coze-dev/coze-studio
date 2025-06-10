import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { Form, FormInputNumber } from '@/index';

describe('FormInputNumber', () => {
  it('should render form input number correctly', () => {
    render(
      <Form>
        <FormInputNumber field="input-number" />
      </Form>,
    );
    const comp = document.getElementsByClassName('coz-input-number');
    expect(comp).toHaveLength(1);
  });
});
