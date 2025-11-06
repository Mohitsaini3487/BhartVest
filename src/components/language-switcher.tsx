'use client';

import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="w-full justify-start gap-2"
    >
      <div className="flex h-5 w-8 items-center justify-center rounded-sm border text-xs font-bold">
        {language === 'en' ? 'En' : 'हि'}
      </div>
      <span className="group-data-[collapsible=icon]:hidden">{language === 'en' ? 'हिन्दी' : 'English'}</span>
    </Button>
  );
}
