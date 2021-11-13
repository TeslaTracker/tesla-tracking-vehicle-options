import IModel3 from './interfaces/Model3.interface';

export const model3: IModel3 = {
  modelKey: '3a1d1c6cdccb462405eee5db90fcbd39',
  options: {
    // Seems to be common between M3 and MY
    paint: [
      'PBSB' /* Black */,
      'PPSB' /* Deep blue */,
      'PMBL' /* Obsidian black */,
      'PMDB' /* Black (placeholder ? ) */
      'PMNG' /* Midnight silver */,
      'PMSS' /* Starlight Silver */,
      'PPSW' /* Pearl white */,
      'PPMR' /* Red */,
    ],
    rearSpoiler: [],
    seats: ['IN3PB' /* Black */, 'IN3PW' /* White */],
    wheels: [
      'W38B' /* 18' Aero */,
      'W39B' /* 19' Sport */,
      'W39P' /* 19' Performance */,
      'W32P' /* 20' Sport */,
      'W32D' /* 20' Sport Gray Performance */,
      'W33D' /* 20' Uberturbine */,
      'WT00' /* No wheels lol */,
    ],
  },
};
