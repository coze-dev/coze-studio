import { REPORT_EVENTS } from '@coze-arch/report-events';
import { CustomError } from '@coze-arch/bot-error';

export function getBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const result = event.target?.result;
      if (!result || typeof result !== 'string') {
        reject(
          new CustomError(REPORT_EVENTS.parmasValidation, 'file read fail'),
        );
        return;
      }
      resolve(result.replace(/^.*?,/, ''));
    };
    fileReader.readAsDataURL(file);
  });
}
