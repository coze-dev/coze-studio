import {
  createTransformOnInit,
  transformOnSubmit,
} from '../trigger-delete/data-transformer';
import { OUTPUTS } from './constants';

const transformOnInit = createTransformOnInit(OUTPUTS);
export { transformOnSubmit, transformOnInit };
