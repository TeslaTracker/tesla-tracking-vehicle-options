import { SupabaseClient } from '@supabase/supabase-js';
import deepEqual from 'deep-equal';

import { detailedDiff } from 'deep-object-diff';
import IStoreData from '../interfaces/StoreData.interface';
import IVehicleSpecs, { IVehicleSpecsDb } from '../interfaces/VehicleSpecs.interface';
import IVehicleSpecsChange from '../interfaces/VehicleSpecsChange.interface';
import Logger from '../logger';
const logger = new Logger('specs');

export async function saveStoreSpecs(specs: IVehicleSpecs[], storeData: IStoreData, supabase: SupabaseClient) {
  logger.log('info', 'Saving store specs...');
  for (const spec of specs) {
    await saveStoreSpec(spec, storeData, supabase);
  }
}

export async function saveStoreSpec(spec: IVehicleSpecs, storeData: IStoreData, supabase: SupabaseClient): Promise<void> {
  // Retrieive the existing item
  const existingSpec = await supabase
    .from<IVehicleSpecsDb>('vehicle_specs')
    .select('data')
    .eq('option_code', spec.option_code)
    .eq('lang', spec.lang)
    .eq('vehicle_model', spec.vehicle_model)
    .limit(1);

  let savedSpec: IVehicleSpecsDb | null = null;

  // check if the last snapshot of this spec is identical
  if (existingSpec.data && existingSpec.data[0]) {
    savedSpec = existingSpec.data[0];

    if (deepEqual(savedSpec.data, spec.data)) {
      logger.log('info', `No changes detected for spec ${spec.option_code} (model: ${spec.vehicle_model} lang: ${spec.lang})`);
      return;
    }
  }

  // if spec don't already exists OR a diff is detected

  logger.log('info', `Changes detected for spec ${spec.option_code}  (model: ${spec.vehicle_model} lang: ${spec.lang})`);

  // if spec already exists, update it
  if (savedSpec) {
    const updateSpec = await supabase
      .from<IVehicleSpecs>('vehicle_specs')
      .update({
        data: spec.data,
      })
      .match({
        id: savedSpec.id,
      });

    if (updateSpec.error) {
      logger.log('error', updateSpec.error.message);
      return;
    }

    const diff = detailedDiff(savedSpec?.data || {}, spec.data);

    // Save the diff once the item has been updated
    const saveChangesDiff = await supabase.from<IVehicleSpecsChange>('vehicle_specs_changes').insert({
      option_code: spec.option_code,
      lang: spec.lang,
      vehicle_model: spec.vehicle_model,
      diff,
    });

    if (saveChangesDiff.error) {
      logger.log('error', saveChangesDiff.error.message);
      return;
    }

    logger.log('success', `Updated spec ${spec.option_code}  (model: ${spec.vehicle_model} lang: ${spec.lang})`);
  } else {
    // if spec doesn't already exists, create it
    const createSpec = await supabase.from<IVehicleSpecs>('vehicle_specs').insert({
      option_code: spec.option_code,
      lang: spec.lang,
      vehicle_model: spec.vehicle_model,
      data: spec.data,
      acceleration_unit: storeData.acceleration_unit.data,
      range_unit: storeData.range_unit.data,
      top_speed_unit: storeData.top_speed_unit.data,
    });

    if (createSpec.error) {
      logger.log('error', createSpec.error.message);
      return;
    }

    logger.log('success', `Created spec ${spec.option_code} (model: ${spec.vehicle_model} lang: ${spec.lang})`);
  }
}

/**
 * Get the specs (vehicle trims) from the store data
 * @param storeData
 * @param lang lang (fr-FR)
 * @param model vehicle model (model3)
 * @returns
 */
export function getSpecsFromStore(storeData: IStoreData, lang: string, model: string): IVehicleSpecs[] {
  const specs: IVehicleSpecs[] = [];

  for (const key in storeData.vehicle_trims.data) {
    if (Object.prototype.hasOwnProperty.call(storeData.vehicle_trims.data, key)) {
      const vehicleTrim = storeData.vehicle_trims.data[key];
      const spec: IVehicleSpecs = {
        option_code: key,
        data: vehicleTrim,
        currency: storeData.currency.data,
        lang: lang,
        vehicle_model: model,
        acceleration_unit: storeData.acceleration_unit.data,
        range_unit: storeData.range_unit.data,
        top_speed_unit: storeData.top_speed_unit.data,
        updated_at: new Date(),
      };
      specs.push(spec);
    }
  }

  return specs;
}
