import puppeteer from 'puppeteer';
import { IDeliveryInfo, IDeliveryInfoDb } from '../interfaces/DeliveryInfo.interface';
import { SupabaseClient } from '@supabase/supabase-js';
import Logger from '../logger';
import IStoreData from '../interfaces/StoreData.interface';

const logger = new Logger('delivery');

export async function saveDeliveryInfos(storeData: IStoreData, lang: string, supabase: SupabaseClient): Promise<void> {
  logger.log('info', `Saving / updating deliveries infos entries ...`);

  const deliveryInfos: IDeliveryInfo[] = storeData.delivery_infos.data;

  if (!deliveryInfos || deliveryInfos.length === 0) {
    logger.log('warn', `No delivery dates to save !`);
    return;
  }

  for (const info of deliveryInfos) {
    if (!info.inEnd || !info.inStart || !info.effectiveStartDate) {
      logger.log('warn', `Delivery info is missing some dates (start, end or effective), skipping ...`);
      continue;
    }

    // check if delivery info already exists
    const existingDeliveryInfo = await supabase
      .from<IDeliveryInfoDb>('vehicle_delivery_infos')
      .select('id')
      .eq('country_code', info.countryCode)
      .eq('effective_date', info.effectiveStartDate)
      .eq('vehicle_model', info.model)
      .eq('start_date', info.inStart)
      .eq('end_date', info.inEnd)
      .eq('lang', lang)
      .contains('option_codes', info.options)
      .limit(1);

    // skip if info already exists
    if (existingDeliveryInfo.data && existingDeliveryInfo.data.length > 0) {
      logger.log('info', `Delivery info already exists for ${info.model} ${info.countryCode} ${info.options.toString()} `);
      continue;
    }

    const saveDeliveryInfo = await supabase.from<IDeliveryInfoDb>('vehicle_delivery_infos').insert({
      vehicle_model: info.model,
      country_code: info.countryCode,
      effective_date: info.effectiveStartDate,
      start_date: info.inStart,
      end_date: info.inEnd,
      option_codes: info.options,
      lang,
    });
    if (saveDeliveryInfo.error) {
      logger.log('error', saveDeliveryInfo.error.message);
      return;
    }

    logger.log('success', `Delivery info saved for ${info.model} ${lang} ${info.options.toString()}`);
  }
}
