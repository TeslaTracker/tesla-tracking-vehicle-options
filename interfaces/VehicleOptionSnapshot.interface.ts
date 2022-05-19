export default interface IVehicleOptionSnapshot {
  id?: string;
  created_at?: Date;
  code: string;
  lang: string;
  data: object;
  vehicle_model: string;
}
