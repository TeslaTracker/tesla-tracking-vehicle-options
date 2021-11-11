const size = 250;
const model = '3a1d1c6cdccb462405eee5db90fcbd39';
const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
import colors from 'colors';
import { Command } from 'commander';
import { model3 } from './library';
const program = new Command();
const urlBase = `https://static-assets.tesla.com/configurator/compositor/?model=%model%&options=%options%&bkba_opt=0&view=STUD_3QTR&size=${size}`;

// cli config
program
  .option('-si, --startIndex <index>', 'Starting index', '0')
  .option('-il, --indexLength <length>', 'Number of item to fetch', '10')
  .option('--delay <delay>', 'Time to wait between queries (ms)', '1000');

program.parse(process.argv);
const options = program.opts();
const carOptions = [];

console.log(options);

for (const optionName in model3.options) {
  if (Object.prototype.hasOwnProperty.call(model3.options, optionName)) {
    const option = model3.options[optionName][0];
    if (option) {
      carOptions.push(option);
    }
  }
}

const url = urlBase.replace('%model%', model).replace('%options%', carOptions.join(','));
console.log(url);

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

console.log(`${colors.cyan(`Looking for new colors`)}`);
console.log(`${colors.cyan(`Starting at index ${colors.white(options.startIndex)}`)}`);
console.log(`${colors.cyan(`Fetching ${colors.white(options.indexLength)} items`)}`);

// generate the potential list of colors ids
const colorIds = generatePossibilitiesArray(alphabet, 4, 'P').length;
