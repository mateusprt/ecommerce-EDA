import { createApp } from './app.js';
import { CONFIG } from './config/constants.js';

const app = createApp();

app.listen(CONFIG.PORT, () => {
  console.log(`\n🚀 Server running on port ${CONFIG.PORT}`);
  console.log(`📝 POST http://localhost:${CONFIG.PORT}/api/orders\n`);
});