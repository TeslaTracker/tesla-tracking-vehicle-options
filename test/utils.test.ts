import { getModelLongName, removeNonNumSymbols } from '../utils';
import { expect } from 'chai';

describe('Model Long', () => {
  it('Should return the long version of a model name', async () => {
    expect(getModelLongName('m3')).to.equal('model3');
    expect(getModelLongName('mx')).to.equal('modelx');
    expect(getModelLongName('my')).to.equal('modely');
    expect(getModelLongName('ms')).to.equal('models');
  });
});

describe('removeNonNumSymbols', () => {
  it('Should remove all non numeric characters form a string and return a number', async () => {
    expect(removeNonNumSymbols('100.22,23')).to.equal(100.2223);
    expect(removeNonNumSymbols('123456')).to.equal(123456);
  });
});
