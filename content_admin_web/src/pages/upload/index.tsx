"use client";

import {
  Box,
  Button,
  Divider,
  Grid,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Paper,
  Select,
  TextField,
  styled,
} from "@mui/material";
import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import { filter, map, reduce } from "lodash";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import useFirebaseStorage, { useFirebaseDB } from "@/hooks/useFirebase";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import { ref, set } from "firebase/database";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import FullPageLoader from "@/components/common/fullpage-loader";
import { AppContext } from "@/context";
import { useRouter } from "next/router";
import UploadFromLocal from "@/components/upload-from-local";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  minHeight: `calc(100vh - 80px)`,
}));

interface FileValidationResult {
  fileName: string;
  isValid: boolean;
}
interface UploadFilesToStorageProps {
  files: FileList;
  path: string;
}

const UploadData = () => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [locale, setLocale] = useState<string | null>("en");
  const appContext = useContext(AppContext);
  const firebaseDb = useFirebaseDB();
  const firebaseStorage = useFirebaseStorage();

  const [validationResults, setValidationResults] = useState<
    FileValidationResult[]
  >([]);
  const router = useRouter();

  const handleListItemClick = useCallback((index: any) => {
    setSelectedIndex(index);
    setInputValue("");
    setFiles(null);
    setValidationResults([]);
  }, []);

  const items = [
    { name: "Brand Name", id: 1 },
    { name: "Hoasted URL", id: 5 },
    { name: "Constant File", id: 2 },
    { name: "Locales", id: 3 },
    { name: "Routes Mapping", id: 4 },
  ];

  const updateVariableValue = useCallback(
    async ({ value, key }: { value: string; key: string }) => {

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
    [firebaseDb, inputValue, appContext.showSnackbar]
  );

  const inputLabel = useMemo(() => {
    switch (Number(selectedIndex)) {
      case 1:
        return "Enter Brand Name";
      case 2:
        return "Constant File";
      case 3:
        return "Enter Folder Path";
      case 5:
        return "Enter Hoasted URL";
      default:
        return null;
    }
  }, [selectedIndex]);

  const uploadFilesToStorage = async ({
    files,
    path,
  }: UploadFilesToStorageProps): Promise<string[]> => {
    const uploadTasks: Promise<string>[] = [];
    setLoading(true);
    // Loop over the files and create upload tasks
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileRef = storageRef(firebaseStorage, `${path}/${file.name}`);
      const uploadTask = uploadBytes(fileRef, file).then(() =>
        getDownloadURL(fileRef)
      );
      uploadTasks.push(uploadTask);
    }

    // Wait for all uploads to complete and return the URLs
    try {
      const downloadUrls: string[] = await Promise.all(uploadTasks);
      setLoading(false);
      setInputValue("");
      setFiles(null);
      return downloadUrls;
    } catch (error) {
      setLoading(false);
      console.error("Error uploading files:", error);
      throw new Error("Failed to upload files");
    }
  };

  const folderPath = useMemo(() => {
    switch (Number(selectedIndex)) {
      case 3:
        return `locales/${locale}`;
      case 4:
        return "mapping";
      default:
        return "constant";
    }
  }, [selectedIndex, locale]);

  const handleUpload = useCallback(async () => {
    if (!files || locale === "" || !locale) {
      alert("Please select files and specify a Firebase storage path.");
      return;
    }
    try {
      const downloadUrls = await uploadFilesToStorage({
        files,
        path: folderPath,
      });

      appContext.showSnackbar({
        open: true,
        content: "Files uploaded successfully!",
      });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload files.");
    }
  }, [appContext, files, folderPath, locale, uploadFilesToStorage]);

  const onSubmit = () => {
    if (selectedIndex === 1) {
      return updateVariableValue({ key: "projectName", value: inputValue });
    }
    if (selectedIndex === 5) {
      return updateVariableValue({ key: "hoastedURL", value: inputValue });
    }
    handleUpload();
  };

  const onLockUpload = useCallback(async () => {
    const result = await set(ref(firebaseDb, `isUploadLocked`), true);

    appContext.showSnackbar({
      open: true,
      content: "Upload locked successfully!",
    });
    router.push("/");
  }, [appContext, firebaseDb, router]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const results: FileValidationResult[] = [];
      setFiles(event.target.files);
      Array.from(files).forEach((file) => {
        if (file.type === "application/json") {
          const reader = new FileReader();

          reader.onload = (e) => {
            try {
              JSON.parse(e.target?.result as string);
              results.push({ fileName: file.name, isValid: true });
              // Update state once all files have been processed
              if (results.length === files.length) {
                setValidationResults(results);
              }
            } catch (error) {
              results.push({ fileName: file.name, isValid: false });
              if (results.length === files.length) {
                setValidationResults(results);
              }
            }
          };

          reader.onerror = () => {
            results.push({ fileName: file.name, isValid: false });
            if (results.length === files.length) {
              setValidationResults(results);
            }
          };

          reader.readAsText(file);
        } else {
          results.push({ fileName: file.name, isValid: false });
          if (results.length === files.length) {
            setValidationResults(results);
          }
        }
      });
    }
  };

  const errorFiles = useMemo(
    () => filter(validationResults, { isValid: false }),
    [validationResults]
  );
  const isSubmitDisabled = useMemo(() => {
    //@ts-ignore
    if ([1, 5].includes(selectedIndex)) {
      return inputValue.trim() === "";
    }
    return errorFiles.length > 0 || files?.length === 0 || !files;
  }, [inputValue, selectedIndex, errorFiles, files]);

  return (
    <div>
      {loading && <FullPageLoader />}
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <Item>
            <Box
              sx={{
                width: "100%",
                maxHeight: "80vh",
                bgcolor: "background.paper",
                overflowY: "scroll",
                overflowX: "auto",
                marginTop: "10px",
                textAlign: "left",
              }}
            >
              <List component="nav" aria-label="main mailbox folders">
                <ListItemButton sx={{ height: 56 }} onClick={onLockUpload}>
                  <ListItemIcon>
                    <LockPersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Lock the upload"
                    primaryTypographyProps={{
                      color: "primary",
                      fontWeight: "medium",
                      variant: "body2",
                    }}
                  />
                </ListItemButton>

                <Divider />
                <ListSubheader>Choose Option to Add</ListSubheader>
                {map(items, (item) => (
                  <ListItemButton
                    key={item.name}
                    selected={selectedIndex === item.id}
                    onClick={(event) => handleListItemClick(item.id)}
                  >
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                ))}
              </List>
              <Divider />
              <List>
                <ListItemButton
                  key="upload"
                  selected={selectedIndex === 6}
                  onClick={(event) => {
                    handleListItemClick(6);
                  }}
                >
                  <ListItemIcon>
                    <CloudUploadIcon />
                  </ListItemIcon>
                  <ListItemText primary="Use Stored Values" />
                </ListItemButton>
              </List>
            </Box>
          </Item>
        </Grid>
        <Grid item xs={9}>
          <Item>
            {selectedIndex && (
              <div
                style={{ maxWidth: "40vw" }}
                className="mx-auto text-left mt-2"
              >
                {selectedIndex === 3 && (
                  <div>
                    <InputLabel id="demo-simple-select-label">
                      Locale
                    </InputLabel>
                    <Select
                      labelId="locale-select"
                      id="locale-select"
                      value={locale}
                      label="Locale"
                      fullWidth
                      onChange={(e) => setLocale(e.target.value as string)}
                    >
                      {map(["en", "ar", "ru", "tr"], (folder) => (
                        <MenuItem value={folder} key={folder}>
                          {folder}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                )}
                {[1, 5].includes(selectedIndex) && (
                  <TextField
                    label={inputLabel}
                    variant="outlined"
                    className="w-100"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                    }}
                  />
                )}
                {![1, 5, 6].includes(selectedIndex) && (
                  <input
                    type="file"
                    className="w-100 form-control mt-3 p-2 "
                    style={{ height: "50px" }}
                    //multiple={selectedIndex === 3}
                    multiple
                    accept=".json"
                    onChange={handleFileChange}
                  />
                )}

                {validationResults.length > 0 && (
                  <ul>
                    {map(errorFiles, (result) => (
                      <li
                        key={result.fileName}
                        className="text-danger list-item"
                        style={{ fontSize: "17px" }}
                      >
                        {result.fileName}:{" Invalid JSON "}
                      </li>
                    ))}
                  </ul>
                )}

                {selectedIndex === 6 && <UploadFromLocal />}
                {selectedIndex === 6 ? null : (
                  <Button
                    component="label"
                    variant="contained"
                    className="mt-2"
                    tabIndex={-1}
                    onClick={onSubmit}
                    startIcon={<CloudUploadIcon />}
                    disabled={isSubmitDisabled}
                  >
                    {[1, 5].includes(selectedIndex) ? "Save" : "Upload"}
                  </Button>
                )}
              </div>
            )}
          </Item>
        </Grid>
      </Grid>
    </div>
  );
};

export default UploadData;
