export default interface IDeliveryInfo {
  vehicle_model: string;
  lang: string;
  country_code: string;
  start_date: Date;
  end_date: Date;
  effective_date: Date;
  /**
   * List of options that, once selected, apply this delivery date
   */
  option_codes: string[];
}
