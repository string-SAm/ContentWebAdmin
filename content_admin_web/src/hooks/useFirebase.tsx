import { AppContext, FirebaseContext, FirebaseContextType } from "@/context";
import { useContext, useEffect, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  listAll,
  ref as storageRef,
} from "firebase/storage";
import { ref, getDatabase } from "firebase/database";
import { useObject } from "react-firebase-hooks/database";
export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (!context)
    throw new Error("useFirebase must be used within a FirebaseProvider");

  return context;
};

export const useFirebaseApp = (): any => {
  const context = useContext(FirebaseContext);
  if (!context)
    throw new Error("useFirebase must be used within a FirebaseProvider");

  return context.firebaseApp;
};

export const useFirebaseDB = () => {
  const context = useContext(FirebaseContext);
  if (!context)
    throw new Error("useFirebase must be used within a FirebaseProvider");
  //@ts-ignore
  return getDatabase(context?.firebaseApp);
};

export const useProjectName = () => {
  const context = useContext(FirebaseContext);
  if (!context)
    throw new Error("useFirebase must be used within a FirebaseProvider");
  //@ts-ignore
  const [snapshot, loading, error] = useObject(
    ref(getDatabase(context?.firebaseApp), "projectName")
  );
  return { projectName: snapshot?.val(), loading, error };
};

export const useVariableValue = (key:string) => {
  const context = useContext(FirebaseContext);
  if (!context)
    throw new Error("useFirebase must be used within a FirebaseProvider");
  //@ts-ignore
  const [snapshot, loading, error] = useObject(
    ref(getDatabase(context?.firebaseApp), key)
  );
  return { value: snapshot?.val(), loading, error };
};

export const useFileLocks = () => {
  const context = useContext(FirebaseContext);
  if (!context)
    throw new Error("useFirebase must be used within a FirebaseProvider");
  //@ts-ignore
  const [snapshot, loading, error] = useObject(
    ref(getDatabase(context?.firebaseApp), "locks/userList")
  );
  return { locks: snapshot?.val(), loading, error };
};

export const useFirebaseStorage = () => {
  const context = useContext(FirebaseContext);
  if (!context)
    throw new Error("useFirebase must be used within a FirebaseProvider");
  //@ts-ignore
  return getStorage(context?.firebaseApp);
};

export const useGetLocaleFolders = () => {
  const [folders, setFolders] = useState<Array<string>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const context = useContext(FirebaseContext);

  useEffect(() => {
    // Only run the effect if the context is available
    if (!context) {
      console.error("useFirebase must be used within a FirebaseProvider");
      setLoading(false);
      return;
    }

    const fetchFolders = async () => {
      try {
        //@ts-ignore
        const storage = getStorage(context.firebaseApp);
        const listRef = storageRef(storage, "locales");
        const result = await listAll(listRef);
      
        const folderNames = result.prefixes.map((folderRef) => folderRef.name);

        setFolders(folderNames);
        setLoading(false);
      } catch (error:any) {
       
        if( error.toString().includes('unauthorized') || error.toString().includes('access')){
         setError("Unauthorized access");
        }
        setLoading(false);
      }
    };

    fetchFolders();
  }, [context]);

  if (!context) {
    return { folders: [], loading: false };
  }

  return { folders, loading, error };
};

export const useGetFirebaseFolders = (path: string) => {
  const [folders, setFolders] = useState<Array<string>>([]);
  const [loading, setLoading] = useState(true);
  const context = useContext(FirebaseContext);

  useEffect(() => {
    // Only run the effect if the context is available
    if (!context || !path) {
      console.error("useFirebase must be used within a FirebaseProvider");
      setLoading(false);
      return;
    }

    const fetchFolders = async () => {
      try {
        //@ts-ignore
        const storage = getStorage(context.firebaseApp);
        const listRef = storageRef(storage, path);
        const result = await listAll(listRef);
        const folderNames = result.prefixes.map((folderRef) => folderRef.name);

        setFolders(folderNames);
        setLoading(false);
      } catch (error) {
        console.error("Error listing folders:", error);
        setLoading(false);
      }
    };

    fetchFolders();
  }, [context, path]);

  if (!context) {
    return { folders: [], loading: false };
  }

  return { folders, loading };
};

export const useGetFolderLocales = (locale: string) => {
  const [files, setFiles] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const context = useContext(FirebaseContext);

  useEffect(() => {
    // Only run the effect if the context is available
    if (!context) {
      console.error("useFirebase must be used within a FirebaseProvider");
      setLoading(false);
      return;
    }

    const fetchFiles = async () => {
      try {
        setLoading(true);
        //@ts-ignore
        const storage = getStorage(context.firebaseApp);
        const listRef = storageRef(storage, `locales/${locale}`);
        const result = await listAll(listRef);
        const filesResp = result.items;

        setFiles(filesResp);
        setLoading(false);
      } catch (error: any) {
        console.error("Error listing folders:", error);
        setError(error);
        setLoading(false);
      }
    };
    if (locale) {
      fetchFiles();
    } else {
      setLoading(false);
    }
  }, [context, locale]);

  if (!context) {
    return { files: [], loading: false, error };
  }

  return { files, loading, error };
};

export const useGetFilesInFolder = (folder: string) => {
  const [files, setFiles] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const context = useContext(FirebaseContext);

  useEffect(() => {
    // Only run the effect if the context is available
    if (!context) {
      console.error("useFirebase must be used within a FirebaseProvider");
      setLoading(false);
      return;
    }

    const fetchFiles = async () => {
      try {
        setLoading(true);
        //@ts-ignore
        const storage = getStorage(context.firebaseApp);
        const listRef = storageRef(storage, `${folder}`);
        const result = await listAll(listRef);
        const filesResp = result.items;

        setFiles(filesResp);
        setLoading(false);
      } catch (error: any) {
        console.error("Error listing folders:", error);
        setError(error);
        setLoading(false);
      }
    };
    if (folder) {
      fetchFiles();
    } else {
      setLoading(false);
    }
  }, [context, folder]);

  if (!context) {
    return { files: [], loading: false, error };
  }

  return { files, loading, error };
};

export const useGetTranslationJson = (fullPath: string) => {
  const [translationData, setTranslationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const context = useContext(FirebaseContext);

  useEffect(() => {
    // Only run the effect if the context is available
    if (!context) {
      console.error("useFirebase must be used within a FirebaseProvider");
      setLoading(true);
      return;
    }

    const fetchFile = async () => {
      try {
        setLoading(true);
        //@ts-ignore
        const storage = getStorage(context.firebaseApp);

        const fileRef = storageRef(storage, fullPath);
        const url = await getDownloadURL(fileRef);
      //  const response = await fetch(url);
      
        const response = await fetch(`/api/firebase?filePath=${encodeURIComponent(url)}`);
        const data = await response.json();
  
        setTranslationData(data);
        setLoading(false);
      } catch (error: any) {
        console.error("Error listing folders:", error);
        setError(error);
        setLoading(false);
      }
    };
    if (fullPath) {
      fetchFile();
    } else {
      setLoading(true);
    }
  }, [context, fullPath]);

  if (!context) {
    return { translationData: {}, loading: false, error };
  }

  return { translationData, loading, error };
};



export default useFirebaseStorage;
