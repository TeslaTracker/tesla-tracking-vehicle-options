// import { expect } from 'chai';
// import { getDefaultStoreData, scrapStorePage } from '../modules/store';

// describe('Scrap data', () => {
//   it('should scrap data for a model3 in English (US)', async () => {
//     const defaultStoreData = getDefaultStoreData('m3');
//     const rawData = await scrapStorePage('en-US', 'm3');
//     expect(rawData).to.be.an('object');
//     const storeData = hydrateStoreData(rawData, defaultStoreData);
//     expect(storeData.options.data.$PBSB).to.be.an('object');
//     expect(storeData.options.data.$PBSB.name).to.equal('Solid Black');
//   });

//   it('should scrap data for a model3 in French', async () => {
//     const defaultStoreData = getDefaultStoreData('m3');
//     const rawData = await getRawStoreData('fr-FR', 'm3');
//     expect(rawData).to.be.an('object');
//     const storeData = hydrateStoreData(rawData, defaultStoreData);
//     expect(storeData.options.data.$PBSB).to.be.an('object');
//     expect(storeData.options.data.$PBSB.name).to.equal('Noir Uni');
//   });

//   it('should scrap data for a model3 in Spanish', async () => {
//     const defaultStoreData = getDefaultStoreData('m3');
//     const rawData = await getRawStoreData('es-ES', 'm3');
//     expect(rawData).to.be.an('object');
//     const storeData = hydrateStoreData(rawData, defaultStoreData);
//     expect(storeData.options.data.$PBSB).to.be.an('object');
//     expect(storeData.options.data.$PBSB.name).to.equal('Negro sólido');
//   });

//   it('should scrap data for a modelx in English (US)', async () => {
//     const defaultStoreData = getDefaultStoreData('mx');
//     const rawData = await getRawStoreData('en-US', 'mx');
//     expect(rawData).to.be.an('object');
//     const storeData = hydrateStoreData(rawData, defaultStoreData);
//     expect(storeData.options.data.$PBSB).to.be.an('object');
//   });

//   it('should scrap data for a modely in English (US)', async () => {
//     const defaultStoreData = getDefaultStoreData('my');
//     const rawData = await getRawStoreData('en-US', 'my');
//     expect(rawData).to.be.an('object');
//     const storeData = hydrateStoreData(rawData, defaultStoreData);
//     expect(storeData.options.data.$PBSB).to.be.an('object');
//   });
// });
