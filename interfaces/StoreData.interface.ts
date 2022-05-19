export default interface IStoreData {
  [key: string]: {
    path: string[];
    data?: any;
  };
}
