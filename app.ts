import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import colors from 'colors';
import { Command } from 'commander';
import Logger from './logger';
import { getDefaultStoreData, hydrateStoreData, scrapStorePage } from './modules/store';
import { getOptionsFromStore, saveStoreOptions } from './modules/options';
import { getSpecsFromStore, saveStoreSpecs } from './modules/specs';
import { saveDeliveryInfos } from './modules/delivery';

const logger = new Logger();

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
  console.log(`\n\n\n${colors.red('[ TESLA TRACKER ]')} | Language: ${colors.bold(programOpt.lang)} - Model: ${colors.bold(programOpt.model)}\n\n\n`);
  logger.log('info', `Starting tracker`);
  const scrap = await scrapStorePage(programOpt.lang, programOpt.model);

  const defaultStoreData = getDefaultStoreData(programOpt.model);

  const storeData = hydrateStoreData(scrap.rawStoreData, defaultStoreData);
  const options = getOptionsFromStore(storeData, programOpt.lang, programOpt.model);
  await saveStoreOptions(options, supabase);
  const specs = getSpecsFromStore(storeData, programOpt.lang, programOpt.model);
  await saveStoreSpecs(specs, storeData, supabase);
  await saveDeliveryInfos(storeData, programOpt.lang, supabase);
})();
