import { expect } from 'chai';

import { getDefaultStoreData, getRawStoreData, hydrateStoreData } from '../utils';

describe('Scrap data', () => {
  it('should scrap data for a model3 in English', async () => {
    const defaultStoreData = getDefaultStoreData('model3');
    const rawData = await getRawStoreData('en-US', 'model3');
    expect(rawData).to.be.an('object');
    const storeData = hydrateStoreData(rawData, defaultStoreData);
    expect(storeData.options.data.$PBSB).to.be.an('object');
    expect(storeData.options.data.$PBSB.name).to.equal('Solid Black');
  });

  it('should scrap data for a model3 in English', async () => {
    const defaultStoreData = getDefaultStoreData('model3');
    const rawData = await getRawStoreData('fr-FR', 'model3');
    expect(rawData).to.be.an('object');
    const storeData = hydrateStoreData(rawData, defaultStoreData);
    expect(storeData.options.data.$PBSB).to.be.an('object');
    expect(storeData.options.data.$PBSB.name).to.equal('Noir Uni');
  });

  it('should scrap data for a model3 in Spanish', async () => {
    const defaultStoreData = getDefaultStoreData('model3');
    const rawData = await getRawStoreData('es-ES', 'model3');
    expect(rawData).to.be.an('object');
    const storeData = hydrateStoreData(rawData, defaultStoreData);
    expect(storeData.options.data.$PBSB).to.be.an('object');
    expect(storeData.options.data.$PBSB.name).to.equal('Negro sólido');
  });

  it('should scrap data for a modelx in English', async () => {
    const defaultStoreData = getDefaultStoreData('modelx');
    const rawData = await getRawStoreData('en-US', 'modelx');
    expect(rawData).to.be.an('object');
    const storeData = hydrateStoreData(rawData, defaultStoreData);
    expect(storeData.options.data.$PBSB).to.be.an('object');
  });

  // it('should scrap data for a modely in English', async () => {
  //   const defaultStoreData = getDefaultStoreData('modelx');
  //   const rawData = await getRawStoreData('en-US', 'modely');
  //   expect(rawData).to.be.an('object');
  //   const storeData = hydrateStoreData(rawData, defaultStoreData);
  //   expect(storeData.options.data.$PBSB).to.be.an('object');
  // });
});
