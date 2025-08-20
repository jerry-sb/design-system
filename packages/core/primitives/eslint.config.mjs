import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import baseConfigs from '@jerry/eslint-config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [...baseConfigs({ rootDir: __dirname })];
