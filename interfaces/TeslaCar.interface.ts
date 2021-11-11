export default interface ITeslaCar {
  modelKey: string;
  config?: {
    [key: string]: string;
    wheels: string;
    paint: string;
    seats: string;
    rearSpoiler: string;
  };
  options: {
    [key: string]: string[];
    wheels: string[];
    paint: string[];
    seats: string[];
    rearSpoiler: string[];
  };
}
