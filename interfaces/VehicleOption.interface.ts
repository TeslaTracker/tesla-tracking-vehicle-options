export default interface IVehicleOption {
  id?: string;
  updated_at?: Date;
  code: string;
  name: string;
  long_name: string;
  description: string;
  price: number;
  lang: string;
  currency: string;
  effective_date: string;
  is_available: boolean;
  vehicle_model: string;
  data: object;
}

export type IVehicleOptionDb = Omit<IVehicleOption, 'raw_data'>;
