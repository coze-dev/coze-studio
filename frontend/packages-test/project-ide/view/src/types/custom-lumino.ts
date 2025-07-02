import { type Title, type Widget } from '../lumino/widgets';
import { type Signal } from '../lumino/signaling';

export interface CustomTitleType extends Title<Widget> {
  saving: boolean;
}

export interface CustomTitleChanged extends Signal<Title<Widget>, void> {
  emit: (args: void) => void;
}
