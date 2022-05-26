import IStoreData from './interfaces/StoreData.interface';

// async function retrieveVehicleSpecs(page: puppeteer.Page, lang: string): Promise<IVehicleSpecs[]> {
//   logger.log('info', `Retrieveing specs informations...`);

//   const deliveryInfos: IDeliveryInfo[] = [];
//   //Get the vehicle_trim list
//   const eddData: any[] = await page.evaluate(() => {
//     return (window as any).tesla.DSServices['Lexicon.m3'].metadata.specs.data[0].options;
//   });

//   // loop through each entry of the edd object
//   for (const eddEntry of eddData) {
//     // skip if there is no delivery date
//     if (!eddEntry.inStart || !eddEntry.inEnd) {
//       continue;
//     }

//     deliveryInfos.push({
//       country_code: eddEntry.countryCode,
//       effective_date: eddEntry.effectiveStartDate,
//       start_date: eddEntry.inStart,
//       end_date: eddEntry.inEnd,
//       option_codes: eddEntry.options,
//       vehicle_model: eddEntry.model,
//       lang: lang,
//     });
//   }

//   return deliveryInfos;
// }

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
