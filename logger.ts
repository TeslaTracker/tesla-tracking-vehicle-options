import colors from 'colors';

type ErrorLevel = 'error' | 'warn' | 'info' | 'debug' | 'success';

const logger = {};

export default class Logger {
  module?: string;
  constructor(module?: string) {
    this.module = module;
  }

  log(level: ErrorLevel, message: string) {
    console.log(`${getLevelStr(level)}${getModuleStr(this.module)} ${message}`);
  }
}

function getModuleStr(module?: string) {
  if (!module) {
    return '';
  }
  return colors.bold(` [${module.toUpperCase()}]`);
}

function getLevelStr(level: ErrorLevel) {
  switch (level) {
    case 'error':
      return colors.red(`(${level})`);
    case 'warn':
      return colors.yellow(`(${level})`);
    case 'debug':
      return colors.bold(`(${level})`);
    case 'success':
      return colors.green(`(${level})`);
    default:
      return colors.cyan(`(${level})`);
  }
}
