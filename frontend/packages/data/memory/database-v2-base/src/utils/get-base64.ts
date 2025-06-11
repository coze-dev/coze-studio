import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { CustomError } from '@coze-arch/bot-error';

export const getBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const result = event.target?.result;
      if (!result || typeof result !== 'string') {
        reject(
          new CustomError(ReportEventNames.parmasValidation, 'file read fail'),
        );
        return;
      }
      resolve(result.replace(/^.*?,/, ''));
    };
    fileReader.readAsDataURL(file);
  });
