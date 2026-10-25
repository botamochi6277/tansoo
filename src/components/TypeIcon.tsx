import { typeIcon } from '../clothTypes';

/** Cloth icon from the FontBotamochi icon font. */
export default function TypeIcon({ type }: { type: string }) {
  return <span className={`fb ${typeIcon(type)}`} aria-hidden="true" />;
}
