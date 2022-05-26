import { SupabaseClient } from '@supabase/supabase-js';
import deepEqual from 'deep-equal';
import { detailedDiff } from 'deep-object-diff';
import IStoreData from '../interfaces/StoreData.interface';
import IVehicleOption, { IVehicleOptionDb } from '../interfaces/VehicleOption.interface';
import IVehicleOptionChange from '../interfaces/VehicleOptionChange.interface';
import Logger from '../logger';

const logger = new Logger('options');

export async function saveStoreOptions(options: IVehicleOption[], supabase: SupabaseClient) {
  logger.log('info', 'Saving store options...');
  for (const option of options) {
    await saveStoreOption(option, supabase);
  }
}

export async function saveStoreOption(option: IVehicleOption, supabase: SupabaseClient) {
  // Retrieive the existing item
  const existingOption = await supabase
    .from<IVehicleOptionDb>('vehicle_options')
    .select('data')
    .eq('code', option.code)
    .eq('lang', option.lang)
    .eq('vehicle_model', option.vehicle_model)
    .limit(1);

  let savedOption: IVehicleOptionDb | null = null;

  // check if the last snapshot of this spec is identical
  if (existingOption.data && existingOption.data[0]) {
    savedOption = existingOption.data[0];

    if (deepEqual(savedOption.data, option.data)) {
      logger.log('info', `No changes detected for option ${option.code} (model: ${option.vehicle_model} lang: ${option.lang})`);
      return;
    }
  }

  // if spec don't already exists OR a diff is detected

  logger.log('info', `Changes detected for option ${option.code}  (model: ${option.vehicle_model} lang: ${option.lang})`);

  // if spec already exists, update it
  if (savedOption) {
    const updateOption = await supabase
      .from<IVehicleOption>('vehicle_options')
      .update({
        data: option.data,
        updated_at: new Date(),
      })
      .match({
        id: savedOption.id,
      });

    if (updateOption.error) {
      logger.log('error', updateOption.error.message);
      return;
    }

    const diff = detailedDiff(savedOption?.data || {}, option.data);

    // Save the diff once the item has been updated
    const saveChangesDiff = await supabase.from<IVehicleOptionChange>('vehicle_options_changes').insert({
      option_code: option.code,
      lang: option.lang,
      vehicle_model: option.vehicle_model,
      diff,
    });

    if (saveChangesDiff.error) {
      logger.log('error', saveChangesDiff.error.message);
      return;
    }

    logger.log('success', `Updated option ${option.code}  (model: ${option.vehicle_model} lang: ${option.lang})`);
  } else {
    // if spec doesn't already exists, create it
    const createSpec = await supabase.from<IVehicleOption>('vehicle_specs').insert({
      code: option.code,
      lang: option.lang,
      vehicle_model: option.vehicle_model,
      data: option.data,
    });

    if (createSpec.error) {
      logger.log('error', createSpec.error.message);
      return;
    }

    logger.log('success', `Created spec ${option.code} (model: ${option.vehicle_model} lang: ${option.lang})`);
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
