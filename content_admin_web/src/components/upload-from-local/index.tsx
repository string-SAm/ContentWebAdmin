import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Modal,
  Typography,
} from "@mui/material";
import { every, map, reduce } from "lodash";
import React, { useCallback, useContext, useState } from "react";
import FullPageLoader from "../common/fullpage-loader";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import useFirebaseStorage, { useFirebaseDB } from "@/hooks/useFirebase";
import { ref, set } from "firebase/database";
import { AppContext } from "@/context";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import FullContentLoader from "../common/full-content-loader";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  color: "black",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "10px",
  overflow: "hidden",
  textAlign: "center",
  p: 4,
};
const UploadFromLocal = () => {
  const [loading, setLoading] = React.useState(false);
  const [checked, setChecked] = React.useState<any>({});
  const [open, setOpen] = useState(false);
  const [filesDone, setFilesDone] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const firebaseDb = useFirebaseDB();
  const firebaseStorage = useFirebaseStorage();
  const appContext = useContext(AppContext);
  const constantsList = [
    { label: "Brand Name", value: "projectName", id: 1 },
    { label: "Hoasted URL", value: "hoastedURL", id: 2 },
    { label: "Locales", value: "locales", id: 3 },
    { label: "Mapping", value: "mapping", id: 4 },
  ];

  const updateVariableValue = useCallback(
    async ({ value, key }: { value: string; key: string }) => {
      console.log("debug:", { value, key });
      setLoading(true);
      try {
        const result = await set(ref(firebaseDb, key), value);
        appContext.showSnackbar({
          open: true,
          content: "Value updated successfully!",
        });
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    },
    [firebaseDb, appContext.showSnackbar]
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    setChecked((prev: any) => ({ ...prev, [id]: event.target.checked }));
  };

  const uploadSingleLocale = useCallback(
    async (content: any, path: any) => {
      try {
        // setLoading(true);
        const file = new Blob([JSON.stringify(content)], {
          type: "application/json",
        });

        const fileRef = storageRef(firebaseStorage, path);

        await uploadBytes(fileRef, file);
        //    setLoading(false);
        const url = await getDownloadURL(fileRef);
        return url;
      } catch (error) {
        // setLoading(false);
        console.error("Firebase Storage Error:", error);
      }
    },
    [firebaseStorage]
  );
  const uploadDirectory = async (): Promise<void> => {
    const response = await fetch("/api/readFiles", {
      method: "POST",
    });
    const result = await response.json();
    setTotalFiles(Number(result?.files.length) - 4);
    for (const file of result?.files) {
      if (!["ar", "en", "ru", "tr"].includes(file?.name)) {
        const res = await fetch("/api/getContent", {
          method: "POST",
          body: JSON.stringify({
            filePath: `../../constants/${
              file?.path?.split("constants/")?.[1]
            }/${file?.name}`,
          }),
        });
        const jsonResp = await res.json();
        const result = await uploadSingleLocale(
          jsonResp,
          `${file?.path?.split("constants/")?.[1]}/${file?.name}`
        );
        setFilesDone((prev) => prev + 1);
      }
    }
    setOpen(false);
    setFilesDone(0);
  };

  const handlePreLocalesUpload = async () => {
    setOpen(true);
    try {
      await uploadDirectory();
    } catch (error) {
      console.error("Failed to upload files:", error);
    }
  };

  const uploadMapping =useCallback(async()=>{
    setLoading(true);
    const res = await fetch("/api/getContent", {
        method: "POST",
        body: JSON.stringify({
          filePath: `../../constants/mappings/dictionaryMappings.json`,
        }),
      });
      const jsonResp = await res.json();
      const result = await uploadSingleLocale(
        jsonResp,
        `mapping/dictionaryMappings.json`
      );
      setLoading(false);
      return result
  },[]);
  const onUpload = useCallback(() => {
    const uploadList = reduce(
      checked,
      (acc: Array<string>, value, key: string) => {
        if (value) acc.push(key);
        return acc;
      },
      []
    );

    if (uploadList.includes("hoastedURL")) {
      updateVariableValue({
        key: "hoastedURL",
        value: process.env.NEXT_PUBLIC_HOASTED_URL ?? "No URL",
      });
    }
    if (uploadList.includes("projectName")) {
      updateVariableValue({
        key: "projectName",
        value: process.env.NEXT_PUBLIC_BRAND_NAME ?? "No Brand Name",
      });
    }
    if (uploadList.includes("locales")) {
      handlePreLocalesUpload();
    }
    if (uploadList.includes("mapping")) {
        uploadMapping();
    }
  
  }, [checked, updateVariableValue]);

  return (
    <div>
      {loading && <FullPageLoader />}
      <Typography>
        Select the Options you want to set/upload. You can select multiple files.
      </Typography>
      <FormGroup>
        {map(constantsList, (listItem) => (
          <FormControlLabel
            control={
              <Checkbox
                key={listItem.value}
                checked={checked[listItem?.value] || false}
                onChange={(ev) => handleChange(ev, listItem.value)}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
            label={listItem?.label}
          />
        ))}
      </FormGroup>

      <Button
        component="label"
        variant="contained"
        className="mt-2"
        tabIndex={-1}
        disabled={
          Object.values(checked).length === 0 ||
          every(Object.values(checked), (item) => item == false)
        }
        onClick={onUpload}
        startIcon={<CloudUploadIcon />}
      >
        Upload Records
      </Button>
      <Modal
        open={open}
        onClose={() => null}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="position-relative" style={{ height: "100px" }}>
            <FullContentLoader />
          </div>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {filesDone} of {totalFiles} files uploaded successfully
          </Typography>
        </Box>
      </Modal>
    </div>
  );
};

export default UploadFromLocal;
