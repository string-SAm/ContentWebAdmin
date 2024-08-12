import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TranslationContextType {
  translate: (key: string) => string;
  setLanguage: (language: string) => void;
}

export const translations: { [key: string]: { [key: string]: string } } = {
  en: {
    welcome: 'Welcome to the App',
  },
  es: {
    welcome: 'Bienvenido a la aplicación',
  },
};

export const TranslationContext = createContext<TranslationContextType | null>(null);

