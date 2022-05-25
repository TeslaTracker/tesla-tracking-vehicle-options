import { getModelLongName } from '../utils';
import { expect } from 'chai';

describe('Model Long', () => {
  it('Should return the long version of a model name', async () => {
    expect(getModelLongName('m3')).to.equal('model3');
    expect(getModelLongName('mx')).to.equal('modelx');
    expect(getModelLongName('my')).to.equal('modely');
    expect(getModelLongName('ms')).to.equal('models');
  });
});
