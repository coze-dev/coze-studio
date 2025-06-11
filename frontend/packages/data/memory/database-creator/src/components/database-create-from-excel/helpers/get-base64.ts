export function getBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const result = event.target?.result;

      if (!result || typeof result !== 'string') {
        reject(new Error('file read fail'));
        return;
      }

      resolve(result.replace(/^.*?,/, ''));
    };
    fileReader.readAsDataURL(file);
  });
}
