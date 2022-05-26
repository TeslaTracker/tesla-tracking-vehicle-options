import objectPath from 'object-path';
import IStoreData from '../interfaces/StoreData.interface';

import puppeteer from 'puppeteer';
import IDeliveryInfo from '../interfaces/DeliveryInfo.interface';
import { getModelLongName } from '../utils';
import { retrieveDeliveryInfos } from './delivery';
import Logger from '../logger';

const logger = new Logger('store');

/**
 * Get raw storeData from the Tesla store
 * @param {string} lang en-US fr-FR
 * @param {string} vehicleModel m3 mx
 * @returns
 */
export async function scrapStorePage(
  lang: string,
  vehicleModel: string
): Promise<{
  rawStoreData: object;
  deliveryInfos: IDeliveryInfo[];
}> {
  logger.log('info', 'Scrapping store data');

  const vehicleModelLong = getModelLongName(vehicleModel);

  const browser = await puppeteer.launch({
    args: [`'--lang=${lang}'`],
    headless: true,
  });

  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    'Accept-Language': lang,
  });

  const urlLangLabel = lang.replace('-', '_');

  // init the app a first time
  await page.goto(`https://www.tesla.com/${vehicleModelLong}/design`);
  // wait for the app to be ready
  await page.waitForTimeout(2000);
  // force a redirection with the correct language
  await page.goto(`https://www.tesla.com/${urlLangLabel}/${vehicleModelLong}/design#overview`);

  //get the raw store data
  const rawStoreData = await page.evaluate(() => {
    return (window as any).tesla;
  });

  if (!rawStoreData) {
    throw new Error(`No store data found for Model ${vehicleModelLong} and lang ${lang}`);
  }

  const deliveryInfos = await retrieveDeliveryInfos(page, lang);
  // Find the base options , prices and delivery dates
  // const vehicleSpecs = await retrieveVehicleSpecs(page, lang);

  await browser.close();

  return {
    rawStoreData,
    deliveryInfos,
  };
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
export function getDataFromStoreData(storeData: any) {
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
    /**
     * Also called vehicle specs
     * Collection of presets
     */
    vehicle_trims: {
      path: ['DSServices', `Lexicon.${model}`, 'metadata', 'specs', 'data', 0, 'options'],
    },
    specs_metadata: {
      path: ['DSServices', `Lexicon.${model}`, 'metadata', 'specs', 'data', 0, 'meta', 'specs'],
    },
    acceleration_unit: {
      path: ['DSServices', `Lexicon.${model}`, 'metadata', 'specs', 'data', 0, 'meta', 'specs', 'acceleration', 'units'],
    },
    top_speed_unit: {
      path: ['DSServices', `Lexicon.${model}`, 'metadata', 'specs', 'data', 0, 'meta', 'specs', 'topspeed', 'units'],
    },
    range_unit: {
      path: ['DSServices', `Lexicon.${model}`, 'metadata', 'specs', 'data', 0, 'meta', 'specs', 'range', 'units'],
    },
  };
}
