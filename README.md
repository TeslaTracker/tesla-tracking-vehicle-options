# tesla-tracking-vehicle-options

Tracking of the various vehicle options using the image api
Thanks to /u/KemmeyReddit from this [reddit post](https://www.reddit.com/r/teslamotors/comments/gtptpd/tesla_api_to_image/fsej0hi/) for the inspiration !

Also: https://damieng.github.io/tesla-preview/?model=my&MTY04=n&view=STUD_3QTR&background-m3=0&flip=n&paint=PBSB&wheels=WY18B&SLR1=n&seats=INYPB&extras=

Each option is associated with an internal code

This code is referenced in both the configurator (with a $ prefix) and the image API

Example link : https://static-assets.tesla.com/configurator/compositor/?model=3a1d1c6cdccb462405eee5db90fcbd39&options=PBSB,WY18B,INYPB,MTY03&bkba_opt=0&view=STUD_3QTR&size=1519

Some interesting ones :

### [`Colors`](https://github.com/TeslaTracker/tracking-tesla-website/blob/master/model3/design.json#L1899)

| Label | Code |
| ------ | ----------- |
| Black   | PBSB |
| Deep Blue | PPSB |
| Obsidian Black    | PMBL |
| Unknown (placeholder ?)   | PMDB |
| Midnight Silver | PMNG |
| Starlight Silver    | PMSS |
| Pearl White | PPSW |
| Red | PPMR |

### [`Wheels`](https://github.com/TeslaTracker/tracking-tesla-website/blob/master/model3/design.json#L1919)

| Label | Code |
| ------ | ----------- |
| 18' Aero   | W38B |
| 19' Sport | W39B |
| 19' Performance    | W39P |
| 20' Sport   | W32P |
| 20' Sport Gray Performance | W32D |
| 20' Uberturbine | W33D |
| No wheels ? lol | WT00 |
