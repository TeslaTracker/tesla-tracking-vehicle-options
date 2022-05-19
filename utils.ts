import { SupabaseClient } from '@supabase/supabase-js';
import deepEqual from 'deep-equal';
import objectPath from 'object-path';
import IStoreData from './interfaces/StoreData.interface';
import IVehicleOption, { IVehicleOptionDb } from './interfaces/VehicleOption.interface';
import IVehicleOptionSnapshot from './interfaces/VehicleOptionSnapshot.interface';
import puppeteer from 'puppeteer';
import logger from './logger';

export async function saveStoreOptions(options: IVehicleOption[], supabase: SupabaseClient) {
  logger.log('info', 'Saving store options...');
  for (const option of options) {
    await saveStoreOption(option, supabase);
  }
}

export async function saveStoreOption(option: IVehicleOption, supabase: SupabaseClient) {
  // retrieve the last snapshot for this option
  const lastSnapsnotResponse = await supabase
    .from<IVehicleOptionSnapshot>('vehicle_options_snapshots')
    .select('data')
    .eq('code', option.code)
    .eq('lang', option.lang)
    .eq('vehicle_model', option.vehicle_model)
    .order('created_at', {
      ascending: false,
    })
    .limit(1);

  // check if the last snapshot of this option is identical
  if (lastSnapsnotResponse.data && lastSnapsnotResponse.data[0]) {
    const snap = lastSnapsnotResponse.data[0];

    if (deepEqual(snap.data, option.raw_data)) {
      logger.log('info', `Last snapshot for ${option.code} is identical`);
      return;
    }
  }

  logger.log('info', `Saving option ${option.code}`);

  // Save the snapshot
  const saveSnapshot = await supabase.from<IVehicleOptionSnapshot>('vehicle_options_snapshots').insert({
    code: option.code,
    lang: option.lang,
    data: option.raw_data,
  });

  if (saveSnapshot.error) {
    logger.log('error', saveSnapshot.error);
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
        raw_data: item,
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
 * @returns
 */
export async function getRawStoreData(lang: string = 'en-US', vehicleModel: string = 'model3'): Promise<object> {
  logger.log('info', 'Scrapping store data');

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
  await page.goto(`https://www.tesla.com/${vehicleModel}/design`);
  // wait for the app to be ready
  await page.waitForTimeout(2000);
  // force a redirection with the correct language
  await page.goto(`https://www.tesla.com/${urlLangLabel}/${vehicleModel}/design#overview`);

  const rawStoreData = await page.evaluate(() => {
    return (window as any).tesla;
  });

  await browser.close();

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
