import ora from 'ora';
import { Command } from 'commander';

import { gen, genTypes } from './actions';

const main = () => {
  const program = new Command();
  program
    .command('gen')
    .description('gen api code by thrift or pb')
    .argument('<projectRoot>', 'project root')
    .option(
      '-f --format-config <formatConfig>',
      'prettier config file',
      '.prettierrc',
    )
    .action(
      (projectRoot, options: { genMock: boolean; formatConfig: string }) => {
        const spinner = ora(
          'Generating api. It may take a few seconds',
        ).start();
        try {
          gen(projectRoot, {
            formatConfig: options.formatConfig,
          });
          spinner.succeed('Generate api successfully');
        } catch (error) {
          spinner.fail('Generate api fail');

          console.error(error);
          process.exit(1);
        }
      },
    );

  program
    .command('filter')
    .description('filter api types')
    .argument('<projectRoot>', 'project root')
    .option(
      '-f --format-config <formatConfig>',
      'prettier config file',
      '.prettierrc',
    )
    .action((projectRoot, options: { formatConfig: string }) => {
      const spinner = ora(
        'Generating filtered types. It may take a few seconds',
      ).start();
      try {
        genTypes(projectRoot, options);
        spinner.succeed('Generate filtered types successfully');
      } catch (error) {
        spinner.fail('Generate filtered types fail');

        console.error(error);
        process.exit(1);
      }
    });

  program.parse(process.argv);
};

main();
