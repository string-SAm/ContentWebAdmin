"use client";
import { AppContext } from "@/context";
import { useFileLocks } from "@/hooks/useFirebase";
import { Alert, Snackbar } from "@mui/material";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
interface AppContextProviderProps {
  children: ReactNode;
  setConfigLoaded: (value: boolean) => void;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
  setConfigLoaded,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [locale, setLocale] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [activeDictionary, setActiveDictionary] = useState(null);
  const [isFileEditing, setIsFileEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    content: "",
    type: "succes",
  });
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    if (typeof window !== undefined) {
      if (localStorage.getItem("user_id")) {
        setUserId(localStorage.getItem("user_id"));
      } else {
        const uuid = uuidv4();
        setUserId(uuid);
        localStorage.setItem("user_id", uuid);
      }
    }
  }, []);

  const showSnackbar = useCallback(({
    content,
    open,
    type = "success",
  }: {
    content: string;
    open: boolean;
    type?: "info" | "error" | "success" | "warning";
  }) => {
    setSnackbar({ open, content, type });
    setTimeout(
      () => setSnackbar({ content: "", open: false, type: "info" }),
      4000
    );
  },[]);

  const providerValues = useMemo(
    () => ({
      locale,
      setLocale,
      activeFile,
      setActiveFile,
      showSnackbar,
      userId,
      setConfigLoaded,
      activeDictionary,
      setActiveDictionary,
      isEditable,
      setIsEditable,
      isFileEditing,
      setIsFileEditing,
    }),
    [
      locale,
      isFileEditing,
      setIsFileEditing,
      setLocale,
      activeFile,
      setActiveFile,
      showSnackbar,
      userId,
      setConfigLoaded,
      activeDictionary,
      setActiveDictionary,
      isEditable,
      setIsEditable,
    ]
  );

 
  return (
    <AppContext.Provider value={providerValues}>
      <>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={snackbar?.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar({ ...snackbar, open: false })} // Optionally close the snackbar
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })} // Close alert on click
            //@ts-ignore
            severity={snackbar.type} // Use the type from state, default to "success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar?.content}
          </Alert>
        </Snackbar>
        {children}
      </>
    </AppContext.Provider>
  );
};
