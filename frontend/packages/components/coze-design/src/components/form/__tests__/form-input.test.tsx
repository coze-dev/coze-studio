import '@testing-library/jest-dom';
import React from 'react';

import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Form } from '@/index';

import { FormInput } from '../input';

describe('FormInput', () => {
  it('should render form input correctly', () => {
    render(
      <Form>
        <FormInput field="input" />
      </Form>,
    );
    const comp = document.getElementsByClassName('coz-input');
    expect(comp).toHaveLength(1);
  });

  it('should render initial form value correctly', () => {
    render(
      <Form initValues={{ input: 'testinput' }}>
        <FormInput field="input" />
      </Form>,
    );
    expect(screen.getByDisplayValue('testinput')).toBeInTheDocument();
  });
});
