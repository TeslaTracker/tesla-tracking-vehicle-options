import IStoreData from '../interfaces/StoreData.interface';

export const defaultStoreData: IStoreData = {
  effective_date: {
    path: ['DSServices', 'Lexicon.m3', 'effective_date'],
  },
  baseConfig: {
    path: ['DSServices', 'Lexicon.m3', 'base_configuration'],
  },
  option_group: {
    path: ['DSServices', 'Lexicon.m3', 'groups'],
  },
  options: {
    path: ['DSServices', 'Lexicon.m3', 'options'],
  },
  currency: {
    path: ['DSServices', 'Lexicon.m3', 'metadata', 'currency_code'],
  },
};
