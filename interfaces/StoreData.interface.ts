export type StoreDataKey = 'effective_date' | 'baseConfig' | 'option_group' | 'options' | 'currency';
type IStoreData = {
  [key: string]: {
    path: string[];
    data?: any;
  };
};

export default IStoreData;
