import { reporter as originReporter } from '@coze-arch/logger';

import { PACKAGE_NAMESPACE } from '../constant';

export const reporter = originReporter.createReporterWithPreset({
  namespace: PACKAGE_NAMESPACE,
});
