import fs from 'fs-promise';
import path from 'path';
import program from 'commander';

import './util/terminate';
import { start } from './api';

(async () => {
  let commandArgs = process.argv;
  let appArgs;

  const tripleDashIndex = process.argv.indexOf('---');
  if (tripleDashIndex !== -1) {
    commandArgs = process.argv.slice(0, tripleDashIndex);
    appArgs = process.argv.slice(tripleDashIndex + 1);
  }

  let dir = process.cwd();
  program
    .version(require('../package.json').version)
    .arguments('[cwd]')
    .option('-p, --app-path <path>', "Override the path to the Electron app to launch (defaults to '.')")
    .option('-l, --enable-logging', 'Enable advanced logging.  This will log internal Electron things')
    .option('-n, --run-as-node', 'Run the Electron app as a Node.JS script')
    .action((cwd) => {
      if (!cwd) return;
      if (path.isAbsolute(cwd) && fs.existsSync(cwd)) {
        dir = cwd;
      } else if (fs.existsSync(path.resolve(dir, cwd))) {
        dir = path.resolve(dir, cwd);
      }
    })
    .parse(commandArgs);

  program.on('--help', () => {
    console.log("  Any arguments found after '---' will be passed to the Electron app, e.g.");
    console.log('');
    console.log('    $ electron-forge /path/to/project -l --- -d -f foo.txt');
    console.log('');
    console.log("  will pass the arguments '-d -f foo.txt' to the Electron app");
  });

  const opts = {
    dir,
    interactive: true,
    enableLogging: !!program.enableLogging,
    runAsNode: !!program.runAsNode,
  };

  if (program.appPath) opts.appPath = program.appPath;
  if (appArgs) opts.args = appArgs;

  await start(opts);
})();
