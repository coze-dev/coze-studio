import React from 'react';

import { inject, injectable } from 'inversify';

import { ProjectIDEClientProps } from '@/types';

import { ProjectIDEWidget } from '../project-ide-widget';

@injectable()
export class ResourceWidget extends ProjectIDEWidget {
  @inject(ProjectIDEClientProps) props: ProjectIDEClientProps;

  render(): any {
    const Component = this.props.view.primarySideBar;
    if (Component) {
      return <Component />;
    }
    return null;
  }
}
