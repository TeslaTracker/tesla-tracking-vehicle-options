import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { getDefaultStoreData, getOptionsFromStore, getRawStoreData, hydrateStoreData, saveStoreOptions } from './utils';

import { Command } from 'commander';
import logger from './logger';

const program = new Command();
// cli config
program
  .option('-l, --lang <lang>', 'lang to check', 'en-GB')
  .option('-m, --model <model>', 'Vehicle model to check', 'model3')
  .option('-t, --test', 'Test mode');
program.parse(process.argv);
const programOpt = program.opts();

const models = ['m3', 'my'];

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || '');

// function getBasePrice() {
//   const storeData = getDefaultStoreData('model3');
//   console.log(storeData.baseConfig.data);
//   let price = 0;
//   for (const optionId of storeData.baseConfig.data) {
//     const option = storeData.options.data[optionId];
//     price += option.price;
//   }
//   console.log(price);
// }

(async () => {
  logger.log('info', `Language: ${programOpt.lang} - Model: ${programOpt.model}`);
  const rawStoreData = await getRawStoreData(programOpt.lang, programOpt.model);

  const defaultStoreData = getDefaultStoreData(programOpt.lang);

  const storeData = hydrateStoreData(rawStoreData, defaultStoreData);
  const options = getOptionsFromStore(storeData, programOpt.lang, programOpt.model);
  await saveStoreOptions(options, supabase);
})();
