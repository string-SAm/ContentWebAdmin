"use client";
import { AppContext } from "@/context";
import {
  useFileLocks,
  useFirebase,
  useFirebaseDB,
  useGetTranslationJson,
  useProjectName,
} from "@/hooks/useFirebase";
import { splitCapitalizeAndRemoveExtension } from "@/utils/split-and-capitalize";
import CachedIcon from '@mui/icons-material/Cached';
import {
  Box,
  Breadcrumbs,
  Container,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import React, {
  ChangeEvent,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import FullPageLoader from "../common/fullpage-loader";
import { checkPlaceholderPresence } from "@/utils/check-placeholder-presence";
import { getNestedValue } from "@/utils/get-nested-key";
import { cloneDeep, get } from "lodash";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import { ref, set } from "firebase/database";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import { useConfirmOnPageExit } from "@/hooks/useConfirmBeforeExit";
export interface JsonData {
  [key: string]: any;
}


const TranslationEditor = () => {
  const appContext = useContext(AppContext);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State to track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSave, setIsAutoSave] = useState(false);
  const { projectName } = useProjectName();
  const [isDisabled, setIsDisabled] = useState(true);
  const firebaseContext = useFirebase();
  const firebaseDb = useFirebaseDB();
  const fileName = useMemo(
    () => splitCapitalizeAndRemoveExtension(appContext?.activeFile?.name),
    [appContext?.activeFile?.name]
  );
  
  const locks = useFileLocks();
  const { fullPath } = appContext?.activeFile || {};

  //@ts-ignore
  const { translationData, error, loading } = useGetTranslationJson(fullPath);

  const [jsonData, setJsonData] = useState<JsonData>({});
  const [copyData, setCopyData] = useState<JsonData>({});

  

  useEffect(() => {
    //@ts-ignore
    if (translationData && Object.keys(translationData).length > 0) {
      const temp = cloneDeep(translationData);
      //@ts-ignore
      setJsonData({ ...temp });
     // if (!Object.keys(copyData).length) {
        setCopyData({ ...temp });
     // }
    }
  }, [translationData]);


  


  useEffect(() => {
    setIsDisabled(true);
  }, [fullPath]);

  const onEnableEdit = useCallback(async () => {
    if (!isDisabled) return;

    // Initialize filteredList directly with filtering operation or empty array
    const filteredList =
      locks?.locks?.filter(
        (lock: { user: string; selectedFile: string }) =>
          lock.user !== appContext?.userId
      ) || [];

    // Always add the current user's new entry
    filteredList.push({ user: appContext?.userId, selectedFile: fullPath , timestamp: Date.now() });

    // Update the database with the new list
    await set(ref(firebaseDb, "locks/userList"), filteredList);
    setIsDisabled(false);
  }, [
    isDisabled,
    locks,
    appContext?.userId,
    fullPath,
    firebaseDb,
    setIsDisabled,
  ]);

  const isSendEnable = useMemo(() => {
    const validateData = (data: any, path = ""): boolean => {
      return Object.keys(data).every((key) => {
        const newPath = path ? `${path}.${key}` : key;

        if (
          data[key] &&
          typeof data[key] === "object" &&
          !Array.isArray(data[key])
        ) {
          return validateData(data[key], newPath);
        }

        const label = getNestedValue({ ...copyData }, newPath) ?? newPath; // Assuming jsonData is the full dataset
        const isValid =
          label && data[key]
            ? checkPlaceholderPresence(label, data[key])
            : true;
        return isValid;
      });
    };

    return validateData(jsonData);
  }, [jsonData, copyData]);

  const renderInputs = (data: JsonData, path = ""): JSX.Element[] => {
    return Object.keys(data).map((key) => {
      const newPath = path ? `${path}.${key}` : key;

      if (
        data[key] &&
        typeof data[key] === "object" &&
        !Array.isArray(data[key])
      ) {
        return (
          <div key={newPath}>
            {/* <strong>{key}:</strong> */}
            {renderInputs(data[key], newPath)}
          </div>
        );
      }
      const label = getNestedValue({ ...copyData }, newPath) ?? newPath; // Using a fallback to newPath if label is undefined

      const isValid =
        label && data[key] ? checkPlaceholderPresence(label, data[key]) : true;
      return (
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { p: 1, width: "100%", mt: 2 },
          }}
          noValidate
          autoComplete="off"
          key={newPath}
        >
          <TextField
            required
            error={!isValid}
            id="outlined-required"
            label={
              <Tooltip title={label} arrow followCursor enterDelay={1000}>
                <span>{label}</span>
              </Tooltip>
            }
            disabled={isDisabled}
            multiline
            helperText={
              !isValid
                ? "Placeholder - {string} missing or altered in the updated value"
                : ""
            }
            value={data[key]}
            sx={{ height: "auto" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleInputChange(newPath, e.target.value)
            }
          />
        </Box>
      );
    });
  };

  useConfirmOnPageExit(!isDisabled || !isSendEnable);

 

  
  const saveChanges = useCallback(async () => {
    try {
      const respone = await firebaseContext?.saveChanges(jsonData, fullPath);
      if (respone) {
        const filteredList =
          locks?.locks?.filter(
            (lock: { user: string; selectedFile: string }) =>
              lock.user !== appContext?.userId
          ) || [];

        // Update the database with the new list
        await set(ref(firebaseDb, "locks/userList"), filteredList);

        appContext.showSnackbar({
          open: true,
          content: "Changes saved successfully",
        });
        appContext.setActiveFile(null);
        setCopyData({});
        setJsonData({});
      }
    } catch (error: any) {
      console.error("Error fetching files:", error);
    }
  }, [firebaseContext, jsonData, locks]);


const onAutoSave =useCallback(async (data:any)=>{
  try {
    setIsAutoSave(true);
    const response = await firebaseContext?.saveChanges(data, fullPath);
    setTimeout(() => {
      setIsAutoSave(false)
    },1000);
  }
  catch(error){
   console.log({error})
  }
 
},[firebaseContext?.saveChanges,fullPath]);
 
  const handleInputChange = useCallback(
    (path: string, value: string) => {
      const keys = path.split(".");
      const newData: JsonData = { ...jsonData };
      let subData: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        subData = subData[keys[i]];
      }
      subData[keys[keys.length - 1]] = value;
      setJsonData(newData);
      setHasUnsavedChanges(true);

      // Reset the timeout each time the user types
      if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        onAutoSave(newData);
      }, 3000);
    },
    [jsonData,saveTimeoutRef.current, onAutoSave]
  );
  return (
    <Container>
      {fileName ? (
        <Box className="text-left ">
          <Box className=" d-flex justify-content-between">
            <Breadcrumbs aria-label="breadcrumb" className="my-3">
              <span className="bold text-primary">
                <HomeIcon /> {projectName}
              </span>
              <span className="text-primary">
                <EditIcon /> Edit Translation
              </span>
              <span>
                <ArticleIcon /> {fileName}
              </span>
            </Breadcrumbs>

            <Box className="text-right">
              <Tooltip title={"Click to enable edit"}>
                <IconButton aria-label="delete" onClick={onEnableEdit}>
                  <EditIcon color="info" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Click to save">
                <IconButton
                  onClick={saveChanges}
                  disabled={isDisabled || !isSendEnable}
                >
                {isAutoSave ? <CachedIcon color="info" /> : <SaveIcon
                    color={isDisabled || !isSendEnable ? "disabled" : "success"}
                  /> }   
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Divider />
          {loading ? (
            <FullPageLoader />
          ) : (
            <Box sx={{ maxHeight: "80vh", overflowY: "scroll", p: 2 }}>
              {renderInputs(jsonData)}
            </Box>
          )}
        </Box>
      ) : (
        <Box className="text-left">
          <Typography variant="h5" component="h2">
            No File Selected
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default TranslationEditor;
