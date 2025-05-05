import { IS_SERVER } from '../utils/getenv.js';

export default function preventDebounceOnServer(value) {
  if (IS_SERVER && value !== 0) {
    throw new Error('Parameter "debounce" is for the client side only.');
  }
  return value;
}
