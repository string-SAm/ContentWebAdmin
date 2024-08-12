import React, { FC, ReactNode } from "react";
import { FirebaseProvider } from "./firebase-provider";
import { TranslationProvider } from "./locale-provider";
import { AppContextProvider } from "./app-context-provider";

const AppProvider: FC<{ children: ReactNode,setConfigLoaded:(configLoaded:boolean)=>void }> = ({ children,setConfigLoaded }) => {
  return (
    <TranslationProvider>
      <AppContextProvider setConfigLoaded={setConfigLoaded}>
        <FirebaseProvider>{children}</FirebaseProvider>
      </AppContextProvider>
    </TranslationProvider>
  );
};

export default AppProvider;
