import { useLanguage } from '@/contexts/language-context';

export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};
