"use client";
import { AppContext } from "@/context";
import { useFirebase, useGetTranslationJson } from "@/hooks/useFirebase";
import { splitCapitalizeAndRemoveExtension } from "@/utils/split-and-capitalize";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import React, {
  ChangeEvent,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import FullPageLoader from "../common/fullpage-loader";
import { checkPlaceholderPresence } from "@/utils/check-placeholder-presence";
import { getNestedValue } from "@/utils/get-nested-key";
import { cloneDeep } from "lodash";

export interface JsonData {
  [key: string]: any;
  
}
const JsonEditor:FC<{file: any,onSetFile:(arg:any)=>void}> = ({file,onSetFile}) => {
  const [loading, setLoading] = useState(false);
  const firebaseContext = useFirebase();
  const appContext = useContext(AppContext);
  const fileName = useMemo(
    () => splitCapitalizeAndRemoveExtension(file?.name),
    [file?.name]
  );

  const { fullPath } = file || {};

  //@ts-ignore
  const { translationData, error, loading: transLoading } = useGetTranslationJson(fullPath);

  const [jsonData, setJsonData] = useState<JsonData>({});
  const [copyData, setCopyData] = useState<JsonData>({});
 

  useEffect(() => {
    //@ts-ignore
    if (translationData && Object.keys(translationData).length > 0) {
      const temp = cloneDeep(translationData)
      //@ts-ignore
      setJsonData({...temp});
      if (!Object.keys(copyData).length) {
        setCopyData({...temp});
      }
    }
  }, [translationData, copyData]);
 
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
    },
    [jsonData]
  );



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
            label={label}
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
  const saveChanges = useCallback(async () => {
    setLoading(true);
    try {
      const respone = await firebaseContext?.saveChanges(jsonData, fullPath);
      if (respone) {
        appContext.showSnackbar({
          open: true,
          content: "Changes saved successfully",
        });
        appContext.setActiveFile(null);
        setCopyData({});
        setJsonData({});
        onSetFile(null);
      }
    } catch (error: any) {
      console.error("Error fetching files:", error);
    }
    setLoading(false);
  }, [firebaseContext, jsonData]);

  return (
    <Container>
      {loading && <FullPageLoader />}
      {fileName ? (
        <Box className="text-left ">
          <Box className=" d-flex justify-content-between">
            <Typography
              variant="h6"
              component="span"
              className="bg-primary p-2 mb-3 text-white "
            >
              You are currently editing- <strong>"{fileName}"</strong> file
            </Typography>
            <Box className="text-right">
              <Button variant="contained" onClick={saveChanges}>
                Save Changes
              </Button>
            </Box>
          </Box>
          {transLoading ? (
            <FullPageLoader />
          ) : (
            <Box sx={{ maxHeight: "80vh", overflowY: "scroll" }}>
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

export default JsonEditor;
