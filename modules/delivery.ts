import puppeteer from 'puppeteer';
import IDeliveryInfo from '../interfaces/DeliveryInfo.interface';
import { SupabaseClient } from '@supabase/supabase-js';
import Logger from '../logger';

const logger = new Logger('delivery');

export async function retrieveDeliveryInfos(page: puppeteer.Page, lang: string): Promise<IDeliveryInfo[]> {
  logger.log('info', `Retrieiving deliveries dates informations...`);

  const deliveryInfos: IDeliveryInfo[] = [];
  //get the raw store data
  const eddData: any[] = await page.evaluate(() => {
    return (window as any).tesla.eddData;
  });

  // loop through each entry of the edd object
  for (const eddEntry of eddData) {
    // skip if there is no delivery date
    if (!eddEntry.inStart || !eddEntry.inEnd) {
      continue;
    }

    deliveryInfos.push({
      country_code: eddEntry.countryCode,
      effective_date: eddEntry.effectiveStartDate,
      start_date: eddEntry.inStart,
      end_date: eddEntry.inEnd,
      option_codes: eddEntry.options,
      vehicle_model: eddEntry.model,
      lang: lang,
    });
  }

  return deliveryInfos;
}

export async function saveDeliveryInfos(deliveryInfos: IDeliveryInfo[], supabase: SupabaseClient): Promise<void> {
  logger.log('info', `Saving / updating ${deliveryInfos.length} deliveries dates entry ...`);

  for (const info of deliveryInfos) {
    // check if delivery info already exists
    const existingDeliveryInfo = await supabase
      .from<IDeliveryInfo>('vehicle_delivery_infos')
      .select('id')
      .eq('country_code', info.country_code)
      .eq('effective_date', info.effective_date)
      .eq('vehicle_model', info.vehicle_model)
      .eq('start_date', info.start_date)
      .eq('end_date', info.end_date)
      .limit(1);

    // skip if info already exists
    if (existingDeliveryInfo.data && existingDeliveryInfo.data.length > 0) {
      logger.log('info', `Delivery info already exists for ${info.vehicle_model} ${info.country_code}`);
      continue;
    }

    const saveDeliveryInfo = await supabase.from<IDeliveryInfo>('vehicle_delivery_infos').insert(info);
    if (saveDeliveryInfo.error) {
      logger.log('error', saveDeliveryInfo.error.message);
      return;
    }
  }
}
