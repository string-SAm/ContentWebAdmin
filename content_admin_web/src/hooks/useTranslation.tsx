import { TranslationContext, TranslationContextType } from "@/context";
import { useContext } from "react";

  export const useTranslation = (): TranslationContextType => {
    const context = useContext(TranslationContext);
    if (!context) throw new Error('useTranslation must be used within a TranslationProvider');
    return context;
  };
  