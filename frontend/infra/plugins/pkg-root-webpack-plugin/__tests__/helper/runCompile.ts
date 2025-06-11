import webpack from 'webpack';
import type { Configuration, Stats } from 'webpack';

export default (config: Configuration): Promise<Stats> => {
  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        return reject(error);
      }

      return resolve(stats!);
    });
  });
};
