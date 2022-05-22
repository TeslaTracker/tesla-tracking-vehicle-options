import { SupabaseClient } from '@supabase/supabase-js';
import deepEqual from 'deep-equal';
import objectPath from 'object-path';
import IStoreData from './interfaces/StoreData.interface';
import IVehicleOption, { IVehicleOptionDb } from './interfaces/VehicleOption.interface';
import puppeteer from 'puppeteer';
import logger from './logger';
import { detailedDiff } from 'deep-object-diff';
import IVehicleOptionChange from './interfaces/VehicleOptionChange.interface';

export async function saveStoreOptions(options: IVehicleOption[], supabase: SupabaseClient) {
  logger.log('info', 'Saving store options...');
  for (const option of options) {
    await saveStoreOption(option, supabase);
  }
}

export async function saveStoreOption(option: IVehicleOption, supabase: SupabaseClient) {
  // retrieve the last snapshot for this option
  const lastSnapsnotResponse = await supabase
    .from<IVehicleOption>('vehicle_options')
    .select('data')
    .eq('code', option.code)
    .eq('lang', option.lang)
    .eq('vehicle_model', option.vehicle_model)
    .limit(1);

  let savedOption: IVehicleOption | null = null;

  // check if the last snapshot of this option is identical
  if (lastSnapsnotResponse.data && lastSnapsnotResponse.data[0]) {
    savedOption = lastSnapsnotResponse.data[0];

    if (deepEqual(savedOption.data, option.data)) {
      logger.log('info', `No changes detected for option ${option.code} (model: ${option.vehicle_model} lang: ${option.lang})`);
      return;
    }
  }

  logger.log('info', `Changes detected for option ${option.code}  (model: ${option.vehicle_model} lang: ${option.lang})`);

  const diff = detailedDiff(savedOption?.data || {}, option.data);

  // Save the snapshot
  const saveChangesDiff = await supabase.from<IVehicleOptionChange>('vehicle_options_changes').insert({
    option_code: option.code,
    option_lang: option.lang,
    option_vehicle_model: option.vehicle_model,
    diff: diff,
  });

  if (saveChangesDiff.error) {
    logger.log('error', saveChangesDiff.error);
    return;
  }

  // Save the option
  const saveOption = await supabase.from<IVehicleOptionDb>('vehicle_options').upsert({
    code: option.code,
    name: option.name,
    long_name: option.long_name,
    description: option.description,
    price: option.price,
    lang: option.lang,
    currency: option.currency,
    effective_date: option.effective_date,
    is_available: true,
    vehicle_model: option.vehicle_model,
    data: option.data,
    updated_at: new Date(),
  });

  if (saveOption.error) {
    logger.log('error', saveOption.error);
    return;
  }
}

/**
 * Get the options from the store data
 * @param storeData
 * @param lang lang (fr-FR)
 * @param model vehicle model (model3)
 * @returns
 */
export function getOptionsFromStore(storeData: IStoreData, lang: string, model: string): IVehicleOption[] {
  const options: IVehicleOption[] = [];

  for (const key in storeData.options.data) {
    if (Object.prototype.hasOwnProperty.call(storeData.options.data, key)) {
      const item = storeData.options.data[key];
      const option: IVehicleOption = {
        code: key,
        name: item.name,
        long_name: item.name,
        description: item.description,
        price: item.price,
        lang: lang,
        data: item,
        currency: storeData.currency.data,
        effective_date: storeData.effective_date.data,
        updated_at: new Date(),
        is_available: true,
        vehicle_model: model,
      };
      options.push(option);
    }
  }

  return options;
}

/**
 * Get raw storeData from the Tesla store
 * @param {string} lang en-US fr-FR
 * @param {string} vehicleModel m3 mx
 * @returns
 */
export async function getRawStoreData(lang: string, vehicleModel: string): Promise<object> {
  logger.log('info', 'Scrapping store data');

  const vehicleModelLong = getModelLongName(vehicleModel);

  const browser = await puppeteer.launch({
    args: [`'--lang=${lang}'`],
  });

  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    'Accept-Language': lang,
  });
  // Set the language forcefully on javascript
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'language', {
      get: function () {
        return lang;
      },
    });
    Object.defineProperty(navigator, 'languages', {
      get: function () {
        return [lang];
      },
    });
  });

  const urlLangLabel = lang.replace('-', '_');

  // init the app a first time
  await page.goto(`https://www.tesla.com/${vehicleModelLong}/design`);
  // wait for the app to be ready
  await page.waitForTimeout(2000);
  // force a redirection with the correct language
  await page.goto(`https://www.tesla.com/${urlLangLabel}/${vehicleModelLong}/design#overview`);

  const rawStoreData = await page.evaluate(() => {
    return (window as any).tesla;
  });

  await browser.close();

  if (!rawStoreData) {
    throw new Error(`No store data found for Model ${vehicleModelLong} and lang ${lang}`);
  }

  return rawStoreData;
}

/**
 * Put raw storeData within the 'data' prop of each StoreData object and return it
 * @param rawStoreData
 */
export function hydrateStoreData(rawStoreData: object, storeData: IStoreData): IStoreData {
  logger.log('info', 'Formatting store data');

  //hydrate storeData
  for (const itemKey in storeData) {
    if (Object.prototype.hasOwnProperty.call(storeData, itemKey)) {
      const appItem = storeData[itemKey];
      //hydrate the item with the raw app Data
      const itemData = objectPath.get(rawStoreData, appItem.path);
      storeData[itemKey].data = itemData;
    }
  }

  return storeData;
}

/**
 * Return the storeData object but without the path objects
 */
function getDataFromStoreData(storeData: any) {
  let newStoreData: any = {};
  for (const key in storeData) {
    if (Object.prototype.hasOwnProperty.call(storeData, key)) {
      const item = storeData[key];
      newStoreData[key] = item.data;
    }
  }

  return newStoreData;
}

/**
 * Get the long model name from the vehicle model short
 * @param model ms
 * @returns
 * @example getModelNameFromModel('ms') => 'models'
 */
export function getModelLongName(model: string) {
  switch (model) {
    case 'm3':
      return 'model3';
    case 'mx':
      return 'modelx';
    case 'my':
      return 'modely';
    case 'ms':
      return 'models';
    default:
      return '';
  }
}

/**
 * Get a store object with generated paths for the current model
 * @param model model (m3, mx, my, ms)
 * @returns
 */
export function getDefaultStoreData(model: string): IStoreData {
  return {
    effective_date: {
      path: ['DSServices', `Lexicon.${model}`, 'effective_date'],
    },
    baseConfig: {
      path: ['DSServices', `Lexicon.${model}`, 'base_configuration'],
    },
    option_group: {
      path: ['DSServices', `Lexicon.${model}`, 'groups'],
    },
    options: {
      path: ['DSServices', `Lexicon.${model}`, 'options'],
    },
    currency: {
      path: ['DSServices', `Lexicon.${model}`, 'metadata', 'currency_code'],
    },
  };
}
