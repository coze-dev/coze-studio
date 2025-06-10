import '@testing-library/jest-dom';
import React from 'react';

import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { Form } from '@/index';

import { FormUpload } from '../upload';

describe('FormUpload', () => {
  it('should render form upload correctly', () => {
    render(
      <Form>
        <FormUpload field="upload" label="upload-label" action={'/upload'} />
      </Form>,
    );
    const comp = document.getElementsByClassName('semi-upload');
    expect(comp).toHaveLength(1);
  });
});
