const size = {
  height: 140,
  width: 250,
};
const model = '3a1d1c6cdccb462405eee5db90fcbd39';
const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
import axios from 'axios';
import colors from 'colors';
import { Command } from 'commander';
import IModel3 from './interfaces/Model3.interface';
import ITeslaCar from './interfaces/TeslaCar.interface';
import { model3 } from './library';
import { readFile, readJsonSync, writeJsonSync } from 'fs-extra';
import simpleGit from 'simple-git';

const manifestData = readJsonSync('./manifest.json');

const program = new Command();
const urlBase = `https://static-assets.tesla.com/configurator/compositor/?model=%model%&options=%options%&bkba_opt=0&view=STUD_3QTR&size=${size.width}`;

// cli config
program
  .option('-si, --startIndex <index>', 'Starting index', '0')
  .option('-il, --indexLength <length>', 'Number of item to fetch', '10')
  .option('-d, --dev', 'Dev mode')
  .option('--delay <delay>', 'Time to wait between queries (ms)', '1000');

program.parse(process.argv);
const options = program.opts();

if (manifestData.lastScannedIndex) {
  console.log(`${colors.cyan(`Last scanned index: ${colors.white(manifestData.lastScannedIndex)}`)}`);
  options.startIndex = manifestData.lastScannedIndex;
}

searchNewColors().then(async (res) => {
  if (res.colors.length > 0) {
    console.log(`${res.colors.length} new colors found`);

    for (const color of res.colors) {
      console.log(`${colors.green(`=> ${colors.white(color)}`)}`);
      if (manifestData.colors.indexOf(color) === -1) {
        manifestData.colors.push(color);
      } else {
        console.log(`${colors.yellow(`${colors.white(color)} already in manifest`)}`);
      }
    }
  }

  manifestData.lastScannedIndex = parseInt(options.startIndex) + parseInt(options.indexLength);

  if (res.reset) {
    console.log(`${colors.yellow(`Last index reached, reseting indexes`)}`);
    manifestData.lastScannedIndex = 0;
  }
  await updateManifest(manifestData);
});

// const url = urlBase.replace('%model%', model).replace('%options%', carOptions.join(','));

function generatePossibilitiesArray(inputs: any[], length: number, base: string = ''): string[] {
  // each letter of the alphabet
  let list: string[] = [];
  for (let index = 0; index < inputs.length; index++) {
    const item = inputs[index];

    // push if this is an expected result
    if (length === (base + item).length) {
      list.push(base + item);
    }

    if (base.length + 1 < length) {
      list = list.concat(generatePossibilitiesArray(inputs, length, base + item));
    }
  }
  return list;
}

async function searchNewColors(): Promise<{ colors: string[]; reset?: boolean }> {
  return new Promise(async (resolve) => {
    let shouldReset = false;
    const foundColors: string[] = [];
    console.log(`${colors.cyan(`Looking for new colors`)}`);
    console.log(`${colors.cyan(`Starting at index ${colors.white(options.startIndex)}`)}`);
    console.log(`${colors.cyan(`Fetching ${colors.white(options.indexLength)} items`)}`);

    // generate the potential list of colors ids
    const colorIds = generatePossibilitiesArray(alphabet, 4, 'P');

    let startIndex = parseInt(options.startIndex) || 0;

    // if we reached the end, reset
    if (!colorIds[startIndex]) {
      shouldReset = true;
    }

    const indexLength = parseInt(options.indexLength) || 10;

    const splice = colorIds.splice(startIndex, indexLength);

    console.log(`${colors.cyan(`Scanning ${colors.white(String(splice.length))} potential colors`)}`);

    for (const colorId of splice) {
      const url = getUrlForColor(colorId);

      try {
        const imageFile = await getImage(url);
        const templateImage = await readFile('./template_m3.jpg');
        if (await imagesAreIdentical(imageFile, templateImage)) {
          console.log(colorId, `[EMPTY]`);
        } else {
          console.log(`${colors.green(`Wait ... WTF - we found a new color ${colors.white(colorId)} !`)}`);
          foundColors.push(colorId);
        }
        waitFor(options.delay);
      } catch (error) {
        console.log(`${colors.red(`Error fetching ${colors.white(url)}`)}`);
        waitFor(options.delay);
        continue;
      }
    }

    return resolve({
      colors: foundColors,
      reset: shouldReset,
    });
  });
}

async function waitFor(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

function getImage(url: string): Promise<Buffer> {
  console.log(`${colors.cyan(`Fetching ${colors.white(url)}`)}`);

  return new Promise((resolve, reject) => {
    axios
      .get(url, { responseType: 'arraybuffer' })
      .then((response) => {
        const buffer = Buffer.from(response.data, 'base64');

        return resolve(buffer);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function imagesAreIdentical(image1: Buffer, image2: Buffer): Promise<boolean> {
  return new Promise(async (resolve) => {
    return resolve(Buffer.compare(image1, image2) === 0);
  });
}

function getUrlForColor(colorId: string): string {
  const carTemplate: IModel3 = { ...model3 };
  carTemplate.config = {
    paint: colorId,
    rearSpoiler: carTemplate.options.rearSpoiler[0],
    seats: carTemplate.options.seats[0],
    wheels: carTemplate.options.wheels[0],
  };

  const carOptionsStr = carConfigToArray(carTemplate).join(',');

  const url = urlBase.replace('%model%', model).replace('%options%', carOptionsStr);
  return url;
}

function carConfigToArray(car: ITeslaCar): string[] {
  const carConfig: string[] = [];

  for (const optionName in car.config) {
    if (!car.config) {
      return [];
    }
    if (Object.prototype.hasOwnProperty.call(car.config, optionName)) {
      const option = car.config[optionName];
      if (option) {
        carConfig.push(option);
      }
    }
  }
  return carConfig;
}

/**
 * Update the manifest and commit the changes
 * @param data
 */
async function updateManifest(data: any) {
  if (options.dev) {
    console.log(`${colors.yellow(`Dev mode - not committing changes`)}`);
    return;
  }

  console.log(`${colors.cyan(`Updating manifest`)}`);
  writeJsonSync('./manifest.json', data);
  console.log(`${colors.cyan(`Commiting changes`)}`);
  const git = simpleGit();
  await git.cwd(__dirname);
  await git.add('-A');
  await git.commit(`Manifest Updated - index ${manifestData.lastScannedIndex}`);
  await git.push('origin', 'master', ['--force']);
}
