import path from 'pathe';
import fg from 'fast-glob';

import {external, plugins, distDir} from '../../configurations/rollup.config';

const hydrogenExternal = [/@miniflare/, /prettier/];
const cliExternal = [
  ...external,
  ...hydrogenExternal,
  '@oclif/core',
  '@shopify/cli-kit',
  '@bugsnag/js',
];

const features = ['app', 'theme', 'hydrogen'];

const featureCommands = features
  .flatMap((feature) => {
    return fg.sync([
      path.join(__dirname, `../${feature}/src/commands/*/*.ts`),
      path.join(__dirname, `../${feature}/src/commands/*.ts`),
      `!${path.join(__dirname, `../${feature}/src/commands/**/*.test.ts`)}`,
    ]);
  })
  .filter((commandPath) => {
    return !commandPath.includes('/commands/hydrogen/init');
  });

const configuration = () => [
  // CLI
  {
    input: [path.join(__dirname, 'src/index.ts'), ...featureCommands],
    output: [
      {
        dir: distDir(__dirname),
        format: 'esm',
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.facadeModuleId.includes('src/commands')) {
            // Preserves the commands/... path
            return `commands/${chunkInfo.facadeModuleId
              .split('src/commands')
              .pop()
              .replace('ts', 'js')}`;
          } else {
            return '[name].js';
          }
        },
      },
    ],
    plugins: plugins(__dirname),
    external: cliExternal,
  },
];

export default configuration;