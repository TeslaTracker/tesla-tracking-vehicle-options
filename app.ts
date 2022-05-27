import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import colors from 'colors';
import { Command } from 'commander';
import Logger from './logger';
import { getDefaultStoreData, hydrateStoreData, initBrowser, scrapStorePage } from './modules/store';
import { getOptionsFromStore, saveStoreOptions } from './modules/options';
import { getSpecsFromStore, hydratePricesFromStore, saveStoreSpecs } from './modules/specs';
import { saveDeliveryInfos } from './modules/delivery';
import { langs, models } from './options';

const logger = new Logger();

const randLang = langs[Math.floor(Math.random() * langs.length)];
const randModel = models[Math.floor(Math.random() * models.length)];

const program = new Command();
// cli config
program
  .option('-l, --lang [langs...]', 'langs to check', `${randLang}`)
  .option('-m, --model [models...]', 'Vehicle models to check (short format : ms m3 mx ...)', `${randModel}`)
  .option('-t, --test', 'Test mode');
program.parse(process.argv);
const programOpt = program.opts();

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || '');

(async () => {
  const startTime = new Date();
  console.log(`\n\n\n${colors.red('[ TESLA TRACKER ]')} | Language: ${colors.bold(programOpt.lang)} - Model: ${colors.bold(programOpt.model)}\n\n\n`);
  logger.log('info', `Starting tracker`);

  // apply star parameters (apply all)
  if (programOpt.lang[0] === '*') {
    programOpt.lang = langs;
  }

  if (programOpt.model[0] === '*') {
    programOpt.model = models;
  }

  // force opts to be array
  if (!Array.isArray(programOpt.lang)) {
    programOpt.lang = [programOpt.lang];
  }

  if (!Array.isArray(programOpt.model)) {
    programOpt.model = [programOpt.model];
  }
  //

  const jobsCount = programOpt.lang.length * programOpt.model.length;

  logger.log('info', `Running ${colors.bold(String(jobsCount))} job(s)`);

  // run for each lang
  for (const lang of programOpt.lang) {
    for (const model of programOpt.model) {
      await runJob(lang, model);
    }
  }

  const endTime = new Date();

  logger.log('success', `${colors.bold(String(jobsCount))} jobs done in ${colors.bold(String((endTime.getTime() - startTime.getTime()) / 1000))}s`);

  //
})();

async function runJob(lang: string, model: string) {
  logger.log('info', `Starting job for ${colors.bold(lang)} - ${colors.bold(model)}`);
  const { browser, page } = await initBrowser(lang);
  const scrap = await scrapStorePage(lang, model, browser, page);

  const defaultStoreData = getDefaultStoreData(model);

  let storeData = hydrateStoreData(scrap.rawStoreData, defaultStoreData);
  storeData = await hydratePricesFromStore(storeData, page);

  const options = getOptionsFromStore(storeData, lang, model);
  await saveStoreOptions(options, supabase);
  const specs = getSpecsFromStore(storeData, lang, model);
  await saveStoreSpecs(specs, storeData, supabase);
  await saveDeliveryInfos(storeData, lang, supabase);

  // close the browser
  await browser.close();
  logger.log('success', `Job done for ${colors.bold(lang)} - ${colors.bold(model)}`);
}
