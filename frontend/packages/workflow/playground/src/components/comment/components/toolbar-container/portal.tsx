import ReactDOM from 'react-dom';
import { type ReactNode } from 'react';

interface IPortal {
  container: HTMLElement;
  children?: ReactNode;
}

export const Portal = ({ children, container }: IPortal) =>
  typeof document === 'object'
    ? ReactDOM.createPortal(children, container)
    : null;
