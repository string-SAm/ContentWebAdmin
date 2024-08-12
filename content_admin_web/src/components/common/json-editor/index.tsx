import { useConfirmOnPageExit } from "@/hooks/useConfirmBeforeExit";
import {
  useFileLocks,
  useFirebase,
  useFirebaseDB,
  useGetTranslationJson,
  useProjectName,
} from "@/hooks/useFirebase";

import { checkPlaceholderPresence } from "@/utils/check-placeholder-presence";
import { getNestedValue } from "@/utils/get-nested-key";
import { Box, IconButton, TextField, Tooltip } from "@mui/material";
import { cloneDeep } from "lodash";
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
import { ref, set } from "firebase/database";
import FullContentLoader from "../full-content-loader";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CachedIcon from "@mui/icons-material/Cached";
import { AppContext } from "@/context";
export interface JsonData {
  [key: string]: any;
}
const JsonEditor: FC<{ file: string }> = ({ file }) => {
  const appContext = useContext(AppContext);
  const [jsonData, setJsonData] = useState<JsonData>({});
  const [copyData, setCopyData] = useState<JsonData>({});
  const firebaseContext = useFirebase();
  const [isAutoSave, setIsAutoSave] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const locks = useFileLocks();
  const firebaseDb = useFirebaseDB();
  const {
    translationData: fileContent,
    error,
    loading: contentLoading,
  } = useGetTranslationJson(file);


  useEffect(() => {
    //@ts-ignore
    if (fileContent && Object.keys(fileContent).length > 0) {
      const temp = cloneDeep(fileContent);
      //@ts-ignore
      setJsonData({ ...temp });
      if (!Object.keys(copyData).length) {
        setCopyData({ ...temp });
      }
    }
  }, [fileContent]);
  //   const fullPath=useMemo(()=>,[file]);
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



  
  const onAutoSave = useCallback(
    async (data: any) => {
      try {
        setIsAutoSave(true);
        const response = await firebaseContext?.saveChanges(data, file);
        setTimeout(() => {
          setIsAutoSave(false);
        }, 1000);
      } catch (error) {
        console.log({ error });
      }
    },
    [firebaseContext?.saveChanges, file]
  );

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
    [jsonData, saveTimeoutRef.current]
  );

  const onEnableEdit = useCallback(async () => {
    if (!isDisabled) return;

    // Initialize filteredList directly with filtering operation or empty array
    const filteredList =
      locks?.locks?.filter(
        (lock: { user: string; selectedFile: string }) =>
          lock.user !== appContext?.userId
      ) || [];

    // Always add the current user's new entry
    filteredList.push({
      user: appContext?.userId,
      selectedFile: file,
      timestamp: Date.now(),
    });

    // Update the database with the new list
    await set(ref(firebaseDb, "locks/userList"), filteredList);
    setIsDisabled(false);
    appContext.setIsEditable(true);
  }, [isDisabled, locks, appContext?.userId, file, firebaseDb, setIsDisabled]);

  const onSaveChanges = useCallback(async () => {
    try {
      const { saveChanges } = firebaseContext || {};
      const {
        userId,
        showSnackbar,
        setActiveFile,
        setActiveDictionary,
        setIsEditable,
      } = appContext || {};

      if (!saveChanges || !userId) {
        console.error("Missing necessary context functions or userId");
        return;
      }

      const response = await saveChanges(jsonData, file);
      if (response) {
        const filteredList =
          locks?.locks?.filter(
            (lock: { user: string; selectedFile: string }) =>
              lock.user !== userId
          ) || [];

        showSnackbar({
          open: true,
          content: "Changes saved successfully",
        });
        setActiveFile(null);
        setActiveDictionary(null);
        setCopyData({});
        setJsonData({});

        setTimeout(async () => {
          await set(ref(firebaseDb, "locks/userList"), filteredList);
        }, 500);

        setIsEditable(false);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  }, [
    firebaseContext,
    jsonData,
    file,
    locks,
    appContext,
    setCopyData,
    setJsonData,
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

  useConfirmOnPageExit(!isDisabled || !isSendEnable);
  return (
    <Box>
      <Box className="text-right bg-white" >
        <Tooltip title={"Click to enable edit"}>
          <IconButton aria-label="delete" onClick={onEnableEdit}>
            <EditIcon color="info" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Click to save">
          <IconButton
            onClick={onSaveChanges}
            disabled={isDisabled || !isSendEnable}
          >
            {isAutoSave ? (
              <CachedIcon color="info" />
            ) : (
              <SaveIcon
                color={isDisabled || !isSendEnable ? "disabled" : "success"}
              />
            )}
          </IconButton>
        </Tooltip>
      </Box>
      {contentLoading ? <FullContentLoader /> : <> {renderInputs(jsonData)}</>}
    </Box>
  );
};

export default JsonEditor;
