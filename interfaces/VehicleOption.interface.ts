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
  raw_data: object;
  vehicle_model: string;
}

export type IVehicleOptionDb = Omit<IVehicleOption, 'raw_data'>;
