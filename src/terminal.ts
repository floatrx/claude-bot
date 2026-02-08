import { exec } from 'child_process';
import { promisify } from 'util';

import { config } from './config.js';

const execAsync = promisify(exec);

export async function isSessionAvailable(): Promise<boolean> {
  try {
    await execAsync(`tmux has-session -t ${config.tmuxSession}`);
    return true;
  } catch {
    return false;
  }
}

export async function sendToTerminal(keys: string): Promise<boolean> {
  if (!(await isSessionAvailable())) return false;

  try {
    await execAsync(`tmux send-keys -t ${config.tmuxSession} "${keys}"`);
    return true;
  } catch {
    return false;
  }
}

export async function approve(): Promise<boolean> {
  await sendToTerminal('y');
  return sendToTerminal('Enter');
}

export async function deny(): Promise<boolean> {
  await sendToTerminal('n');
  return sendToTerminal('Enter');
}

export async function skip(): Promise<boolean> {
  await sendToTerminal('s');
  return sendToTerminal('Enter');
}

export async function escape(): Promise<boolean> {
  return sendToTerminal('Escape');
}

export async function sendText(text: string): Promise<boolean> {
  await sendToTerminal(text);
  return sendToTerminal('Enter');
}
