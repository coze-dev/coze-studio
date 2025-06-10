import resolvePath from '../utils/resolve-path';
import useNode from './use-node';
import useParametersConfig from './use-config';

export default function useErrorMessage(key: string): string {
  const { errors = [] } = useParametersConfig();
  const { field = '' } = useNode();
  const pathSearched = resolvePath(field, key);

  const error = errors.find(({ path }) => pathSearched === path);

  return error?.message || '';
}
