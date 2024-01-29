import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

export async function getInput(
  text: string,
  options: string[] | null = null,
  isServer = false
): Promise<string> {
  const readline = createInterface({
    input: stdin,
    output: stdout,
  });

  const option = await readline.question(
    `[${isServer ? 'SERVER' : 'CLIENT'}] ${text}${
      options && options.length ? ' (' + options.join(' / ') + ')' : ''
    }: `
  );

  readline.close();

  return option;
}
