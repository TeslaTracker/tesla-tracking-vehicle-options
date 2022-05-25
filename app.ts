import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { getDefaultStoreData, getOptionsFromStore, scrapStorePage, hydrateStoreData, saveStoreOptions, saveDeliveryInfos } from './utils';

import { Command } from 'commander';
import logger from './logger';

const langs = ['fr-FR', 'en-GB', 'en-US', 'de-DE', 'es-ES'];
const vehicles = ['m3', 'my', 'ms', 'mx'];

const randLang = langs[Math.floor(Math.random() * langs.length)];
const randVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];

const program = new Command();
// cli config
program
  .option('-l, --lang <lang>', 'lang to check', randLang)
  .option('-m, --model <model>', 'Vehicle model to check (short format : ms m3 mx ...)', randVehicle)
  .option('-t, --test', 'Test mode');
program.parse(process.argv);
const programOpt = program.opts();

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
  const scrap = await scrapStorePage(programOpt.lang, programOpt.model);

  const defaultStoreData = getDefaultStoreData(programOpt.model);

  const storeData = hydrateStoreData(scrap.rawStoreData, defaultStoreData);
  const options = getOptionsFromStore(storeData, programOpt.lang, programOpt.model);
  await saveStoreOptions(options, supabase);
  await saveDeliveryInfos(scrap.deliveryInfos, supabase);
})();
