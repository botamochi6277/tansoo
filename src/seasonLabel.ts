import { useI18n } from './i18n';
import { SEASONS, seasonKey, type Season } from './season';

/** "Spring, Autumn" / "春・秋", or "All year" / "通年" when every season is included. */
export function useSeasonsLabel(): (list: Season[]) => string {
  const { t, lang } = useI18n();
  return (list) =>
    list.length === SEASONS.length ? t('season.all') : list.map((s) => t(seasonKey(s))).join(lang === 'ja' ? '・' : ', ');
}
