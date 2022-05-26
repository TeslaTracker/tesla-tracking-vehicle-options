export type StoreDataKey =
  | 'effective_date'
  | 'baseConfig'
  | 'option_group'
  | 'options'
  | 'currency'
  | 'vehicle_trims'
  | 'specs_metadata'
  | 'acceleration_unit'
  | 'top_speed_unit'
  | 'range_unit';
type IStoreData = {
  [key: string]: {
    path: (string | number)[];
    data?: any;
  };
};

export default IStoreData;
