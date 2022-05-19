import { expect } from 'chai';
import { defaultStoreData } from '../constants/const';
import { getRawStoreData, hydrateStoreData } from '../utils';

describe('Scrap data', () => {
  it('should scrap data', async () => {
    const rawData = await getRawStoreData('en-US');
    expect(rawData).to.be.an('object');
    const storeData = hydrateStoreData(rawData, defaultStoreData);
    expect(storeData.options.data.$PBSB).to.be.an('object');
    expect(storeData.options.data.$PBSB.name).to.equal('Solid Black');
  });

  it('should scrap data in French', async () => {
    const rawData = await getRawStoreData('fr-FR');
    expect(rawData).to.be.an('object');
    const storeData = hydrateStoreData(rawData, defaultStoreData);
    expect(storeData.options.data.$PBSB).to.be.an('object');
    expect(storeData.options.data.$PBSB.name).to.equal('Noir Uni');
  });
});
