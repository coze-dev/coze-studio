import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { LocaleProviderContainer } from '@/__tests__/locale-provider-containner';

import { Layout } from '..';

describe('Layout', () => {
  it('should has className coz-layout', () => {
    const { container } = render(
      <LocaleProviderContainer>
        <Layout />
      </LocaleProviderContainer>,
    );
    expect(container.getElementsByClassName('coz-layout')).toHaveLength(1);
  });

  it('should has className coz-layout-header', () => {
    const { container } = render(
      <LocaleProviderContainer>
        <Layout>
          <Layout.Header>Layout Header</Layout.Header>
        </Layout>
      </LocaleProviderContainer>,
    );
    expect(container.getElementsByClassName('coz-layout-header')).toHaveLength(
      1,
    );
  });

  it('should has className coz-layout-header-title', () => {
    const { container } = render(
      <LocaleProviderContainer>
        <Layout>
          <Layout.Header title="layout title">
            Layout Header with title
          </Layout.Header>
        </Layout>
      </LocaleProviderContainer>,
    );
    expect(
      container.getElementsByClassName('coz-layout-header-title'),
    ).toHaveLength(1);
  });

  it('should has className coz-layout-content', () => {
    const { container } = render(
      <LocaleProviderContainer>
        <Layout>
          <Layout.Content>Layout Content</Layout.Content>
        </Layout>
      </LocaleProviderContainer>,
    );
    expect(container.getElementsByClassName('coz-layout-content')).toHaveLength(
      1,
    );
  });

  it('should has className coz-layout-content-scroll', () => {
    const { container } = render(
      <LocaleProviderContainer>
        <Layout>
          <Layout.Content scrollY={true}>Layout Content</Layout.Content>
        </Layout>
      </LocaleProviderContainer>,
    );
    expect(
      container.getElementsByClassName('coz-layout-content-scroll'),
    ).toHaveLength(1);
  });

  it('should has className coz-layout-breadcrumb', () => {
    const { container } = render(
      <LocaleProviderContainer>
        <Layout>
          <Layout.Header
            title="layout title"
            breadcrumb={
              <span className="coz-layout-header-breadcrumb">breadcrumb</span>
            }
          >
            Layout Header with breadcrumb
          </Layout.Header>
        </Layout>
      </LocaleProviderContainer>,
    );
    expect(
      container.getElementsByClassName('coz-layout-header-breadcrumb'),
    ).toHaveLength(1);
  });

  it('should has className coz-layout-foot', () => {
    const { container } = render(
      <LocaleProviderContainer>
        <Layout>
          <Layout.Footer>Layout Content</Layout.Footer>
        </Layout>
      </LocaleProviderContainer>,
    );
    expect(container.getElementsByClassName('coz-layout-foot')).toHaveLength(1);
  });
});
