"use client";
import { useGetFilesInFolder, useGetFirebaseFolders, useGetFolderLocales, useGetLocaleFolders } from "@/hooks/useFirebase";
import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Typography,
} from "@mui/material";
import React, { FC, useCallback, useContext } from "react";
import { map } from "lodash";
import DescriptionIcon from "@mui/icons-material/Description";
import { AppContext } from "@/context";

const ConstantFileSelector :FC<{onSetFile:any}>= ({onSetFile}) => {
  const [locale, setLocale] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(null);
  const appContext =useContext(AppContext);

  const handleListItemClick = useCallback((
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    file: any
  ) => {
   
    setSelectedIndex(file.name);
    onSetFile(file);
  },[appContext]);

  

  const {
    files,
    loading: filesLoading,
    error: fileError,
  } = useGetFilesInFolder('constant');



  return (
    <div>
      <FormControl fullWidth size="small">
       
        
       
        {filesLoading ? (
          <>
            {
              //@ts-ignore
              [...Array(5).keys()].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={60}
                  className="mt-2"
                />
              ))
            }
          </>
        ) : (
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
              {files?.length > 0 && <ListSubheader>Constant Files</ListSubheader>}
              {map(files, (file) => (
                <ListItemButton
                  key={file?.fullPath}
                  selected={selectedIndex === file.name}
                  onClick={(event) => handleListItemClick(event, file)}
                >
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText primary={file.name} />
                </ListItemButton>
              ))}
            </List>
            <Divider />
          </Box>
        )}
      </FormControl>
    </div>
  );
};



export default ConstantFileSelector