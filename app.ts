import 'dotenv/config';
import puppeteer from 'puppeteer';
import objectPath from 'object-path';
import { createClient } from '@supabase/supabase-js';

const langs = ['en_US', 'de_DE', 'fr_FR', 'es_ES'];
const models = ['m3', 'my'];

interface IStoreSnapshot {
  data: object;
  lang: string;
  currency: string;
  model: string;
}

const appData: {
  [key: string]: {
    path: string[];
    data?: any;
  };
} = {
  effective_date: {
    path: ['DSServices', 'Lexicon.m3', 'effective_date'],
  },
  baseConfig: {
    path: ['DSServices', 'Lexicon.m3', 'base_configuration'],
  },
  option_group: {
    path: ['DSServices', 'Lexicon.m3', 'groups'],
  },
  options: {
    path: ['DSServices', 'Lexicon.m3', 'options'],
  },
  currency: {
    path: ['DSServices', 'Lexicon.m3', 'metadata', 'currency_code'],
  },
};

function getBasePrice() {
  console.log(appData.baseConfig.data);
  let price = 0;
  for (const optionId of appData.baseConfig.data) {
    const option = appData.options.data[optionId];
    price += option.price;
  }
  console.log(price);
}

(async () => {
  const browser = await puppeteer.launch({
    env: { LANGUAGE: 'en_US' },
  });
  const page = await browser.newPage();
  await page.goto('https://www.tesla.com/model3/design');

  const rawAppData = await page.evaluate(() => {
    return (window as any).tesla;
  });

  await browser.close();

  //hydrate appData
  for (const itemKey in appData) {
    if (Object.prototype.hasOwnProperty.call(appData, itemKey)) {
      const appItem = appData[itemKey];
      //hydrate the item with the raw app Data
      const itemData = objectPath.get(rawAppData, appItem.path);
      appData[itemKey].data = itemData;
    }
  }

  const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || '');
  await supabase.from<IStoreSnapshot>('store_snapshots').insert({
    data: getDataFromAppData(appData),
    lang: 'en_US',
    currency: appData.currency.data,
    model: 'm3',
  });
})();

/**
 * Return the appData object but without the path objects
 */
function getDataFromAppData(appData: any) {
  let newAppData: any = {};
  for (const key in appData) {
    if (Object.prototype.hasOwnProperty.call(appData, key)) {
      const item = appData[key];
      newAppData[key] = item.data;
    }
  }

  return newAppData;
}
