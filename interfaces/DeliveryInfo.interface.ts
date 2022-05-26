/**
 * Delivery info entry as displayed by the Tesla store
 */
export interface IDeliveryInfo {
  countryCode: string;
  effectiveStartDate: Date;
  inEnd: Date;
  inStart: Date;
  lastUpdateDatetime: Date;
  model: string;
  /**
   * List of option_code that , once selected, apply the dates
   */
  options: string[];
}

export interface IDeliveryInfoDb {
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
