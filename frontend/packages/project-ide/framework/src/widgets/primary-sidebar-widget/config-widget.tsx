import React from 'react';

import { inject, injectable } from 'inversify';

import { ProjectIDEClientProps } from '@/types';

import { ProjectIDEWidget } from '../project-ide-widget';

@injectable()
export class ConfigWidget extends ProjectIDEWidget {
  @inject(ProjectIDEClientProps) props: ProjectIDEClientProps;

  render() {
    const Component = this.props.view.configuration;
    if (Component) {
      return <Component />;
    }
    return null;
  }
}
