import { TranslationContext, translations } from "@/context";
import { ReactNode, useState } from "react";

interface TranslationProviderProps {
    children: ReactNode;
  }
  
  export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<string>('en');
  
    const translate = (key: string): string => translations[language][key] || key;
  
    return (
      <TranslationContext.Provider value={{ translate, setLanguage }}>
        {children}
      </TranslationContext.Provider>
    );
  };
  