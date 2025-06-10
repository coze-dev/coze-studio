import '@testing-library/jest-dom';
import React from 'react';

import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Form } from '@/index';

import { FormTextArea } from '../text-area';

describe('FormTextArea', () => {
  it('should render form textarea correctly', () => {
    render(
      <Form>
        <FormTextArea field="input" />
      </Form>,
    );
    const comp = document.getElementsByClassName('coz-textarea');
    expect(comp).toHaveLength(1);
  });

  it('should render initial form value correctly', () => {
    render(
      <Form initValues={{ input: 'testarea' }}>
        <FormTextArea field="input" />
      </Form>,
    );
    expect(screen.getByDisplayValue('testarea')).toBeInTheDocument();
  });
});
