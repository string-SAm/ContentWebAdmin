"use client";
import ConfigModal from "@/components/common/firebase-config-modal";
import AppProvider from "@/providers";
import "bootstrap-css-only/css/bootstrap.min.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "@/components/navbar";
import "../styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  const [configLoaded, setConfigLoaded] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("firebase_config")) {
      setConfigLoaded(
        JSON.parse(localStorage.getItem("firebase_config") as string)
      );
    }
  }, []);



  return (
    <AppProvider setConfigLoaded={setConfigLoaded}>
      <>
        <CssBaseline />
        {!configLoaded ? (
          <ConfigModal
            onClose={() => setConfigLoaded(true)}
            open={!configLoaded}
            setConfigLoaded={setConfigLoaded}
          />
        ) : (
          <>
          <Navbar />
          <Component {...pageProps} />
        
          </>
        )}
      </>
    </AppProvider>
  );
}
