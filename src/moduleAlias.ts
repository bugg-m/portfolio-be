import * as path from 'path';

import { addAliases } from 'module-alias';

addAliases({
  '@db': path.join(__dirname, 'db'),
  '@constants': path.join(__dirname, 'constants'),
  '@controllers': path.join(__dirname, 'controllers'),
  '@helpers': path.join(__dirname, 'helpers'),
  '@middlewares': path.join(__dirname, 'middlewares'),
  '@models': path.join(__dirname, 'models'),
  '@routes': path.join(__dirname, 'routes'),
  '@ssl': path.join(__dirname, 'ssl'),
  '@types': path.join(__dirname, 'types'),
  '@utils': path.join(__dirname, 'utils'),
  '@': __dirname,
});
