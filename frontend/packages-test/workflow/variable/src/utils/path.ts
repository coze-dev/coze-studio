import { FormPathService } from '@flowgram-adapter/free-layout-editor';
export function convertGlobPath(path: string) {
  if (path.startsWith('/')) {
    const parts = FormPathService.normalize(path).slice(1).split('/');
    return parts.join('.');
  }
  return path;
}
