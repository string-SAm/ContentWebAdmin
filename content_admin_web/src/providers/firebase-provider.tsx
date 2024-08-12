import React, {
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useContext,
} from "react";
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import "firebase/auth";
import "firebase/firestore";
import { AppContext, FirebaseContext } from "@/context";
import { JsonData } from "@/components/translations/translation-editor";
import { ref, set, onValue, getDatabase } from "firebase/database";
import { Backdrop, CircularProgress } from "@mui/material";
import LockedScreen from "@/components/pages/lock-screen";
import { useRouter } from "next/router";

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
}) => {

  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const appContext = useContext(AppContext);

  const checkDBCreds = useCallback(async () => {
    if (firebaseApp) {
      setLoading(true);
      const db = getDatabase(firebaseApp);
      set(ref(db, "testPath"), "hello")
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          alert(
            "Invalid creds for firebase database. Please enter correct credentials"
          );
          localStorage.removeItem("firebase_config");
          setFirebaseApp(null);
          appContext?.setConfigLoaded(false);

          console.error("Data write failed:", error);
        });
    }
  }, [firebaseApp, appContext?.setConfigLoaded]);

  const testStorage = useCallback(async () => {
    if (firebaseApp) {
      setLoading(true);
      try {
        const file = new Blob(["Hello from Firebase Storage!"], {
          type: "text/plain",
        });

        const storage = getStorage(firebaseApp);
        const fileRef = storageRef(storage, "testFile.txt");

        await uploadBytes(fileRef, file);

        const url = await getDownloadURL(fileRef);
  
      } catch (error) {
        console.error("Firebase Storage Error:", error);
        alert(
          "Invalid creds for firebase storage. Please enter correct credentials"
        );
        localStorage.removeItem("firebase_config");
        setFirebaseApp(null);
        appContext?.setConfigLoaded(false);
      }
    }
    setLoading(false);
  }, [firebaseApp]);

  useEffect(() => {
    if (firebaseApp) {
      checkDBCreds();
      testStorage();
    }
  }, [firebaseApp, testStorage, checkDBCreds]);

  const initializeFirebase = useCallback((config: Object) => {
    if (typeof window !== "undefined") {
      try {
        setFirebaseApp(getApp());
        localStorage.setItem("firebase_config", JSON.stringify(config));
      } catch {
        setFirebaseApp(initializeApp(config));
        localStorage.setItem("firebase_config", JSON.stringify(config));
      }
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("firebase_config")) {
      initializeFirebase(JSON.parse(localStorage.getItem("firebase_config")!));
    }
  }, []);

  const saveChanges = async (jsonData: JsonData, path: string) => {
    try {
   
      //@ts-ignore
      const storage = getStorage(firebaseApp);
      const fileRef = storageRef(storage, path);

      const newBlob = new Blob([JSON.stringify(jsonData)], {
        type: "application/json",
      });
      return uploadBytes(fileRef, newBlob);
    } catch (error: any) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    if (firebaseApp) {
      const db = getDatabase(firebaseApp);
      const finalizedRef = ref(db, "isFinalized");

      // Set up the listener for the Firebase data
      const unsubscribe = onValue(
        finalizedRef,
        (snapshot) => {
          const isFinalized = snapshot.val(); // Assuming 'isFinalized' is a boolean
          setIsLocked(isFinalized);
        },
        (error) => {
          console.error("Firebase read failed: ", error);
        }
      );

      // Clean up the listener when the component unmounts or dependencies change
      return () => {
        unsubscribe();
      };
    }
  }, [firebaseApp, setIsLocked]);


  if (loading)
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open
        onClick={() => null}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  return (
    <FirebaseContext.Provider
    //@ts-ignore
      value={{ firebaseApp, initializeFirebase, saveChanges }}
    >
      {isLocked ? <LockedScreen /> : children}
    </FirebaseContext.Provider>
  );
};
