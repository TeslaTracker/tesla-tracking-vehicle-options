export default interface IVehicleSpecs {
  updated_at?: Date;
  vehicle_model: string;
  lang: string;
  currency: string;
  option_code: string;
  data: {
    acceleration: number;
    price: number;
    top_speed: number;
    range: number;
  };

  range_unit: string;
  top_speed_unit: string;
  acceleration_unit: string;
}

export type IVehicleSpecsDb = IVehicleSpecs & { id: string };
