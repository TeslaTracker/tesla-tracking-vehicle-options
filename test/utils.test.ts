import { getModelShort } from '../utils';
import { expect } from 'chai';

describe('Model short', () => {
  it('Should return the short version of a model name', async () => {
    expect(getModelShort('model3')).to.equal('m3');
    expect(getModelShort('modelx')).to.equal('mx');
    expect(getModelShort('modely')).to.equal('my');
    expect(getModelShort('models')).to.equal('ms');
  });
});
