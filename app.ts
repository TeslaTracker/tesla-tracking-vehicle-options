import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import colors from 'colors';
import { Command } from 'commander';
import Logger from './logger';
import { getDefaultStoreData, hydrateStoreData, initBrowser, scrapStorePage } from './modules/store';
import { getOptionsFromStore, saveStoreOptions } from './modules/options';
import { getSpecsFromStore, hydratePricesFromStore, saveStoreSpecs } from './modules/specs';
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

(async () => {
  console.log(`\n\n\n${colors.red('[ TESLA TRACKER ]')} | Language: ${colors.bold(programOpt.lang)} - Model: ${colors.bold(programOpt.model)}\n\n\n`);
  logger.log('info', `Starting tracker`);

  const { browser, page } = await initBrowser(programOpt.lang);
  const scrap = await scrapStorePage(programOpt.lang, programOpt.model, browser, page);

  const defaultStoreData = getDefaultStoreData(programOpt.model);

  let storeData = hydrateStoreData(scrap.rawStoreData, defaultStoreData);
  storeData = await hydratePricesFromStore(storeData, page);

  const options = getOptionsFromStore(storeData, programOpt.lang, programOpt.model);
  await saveStoreOptions(options, supabase);
  const specs = getSpecsFromStore(storeData, programOpt.lang, programOpt.model);
  await saveStoreSpecs(specs, storeData, supabase);
  await saveDeliveryInfos(storeData, programOpt.lang, supabase);

  // close the browser
  await browser.close();
})();
