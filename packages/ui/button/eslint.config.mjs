import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import reactConfigs from '@jerryshim/eslint-config/react-package';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [...reactConfigs({ rootDir: __dirname })];
