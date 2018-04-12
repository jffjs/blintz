export function printLn(output: string) {
  process.stdout.write(`${output}\n`);
}

export function printErr(err: string) {
  process.stderr.write(`${err}\n`);
}
