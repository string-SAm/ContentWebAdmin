"use client";
import {
  Box,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Skeleton,
  styled,
} from "@mui/material";

import { useGetLocaleFolders } from "@/hooks/useFirebase";
import React, { useCallback, useContext, useEffect, useState } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import MetaEditor from "@/components/meta-editor";
import { AppContext } from "@/context";
import { map } from "lodash";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  minHeight: `calc(100vh - 80px)`,
}));

const Metadata = () => {
  const [locale, setLocale] = React.useState("");
  const [isFileAvailable, setFileAvailable] = useState(false);
  const [isLocaleLoading, setIsLocaleLoading] = useState(false);
  const appContext = useContext(AppContext);
  const { folders, loading, error } = useGetLocaleFolders();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localeFromStorage = localStorage.getItem("selectedLocale");
      if (localeFromStorage) {
        setLocale(localeFromStorage);

        appContext?.setLocale(localeFromStorage);
      }
    }
  }, []);

  const startLoading = useCallback(() => {
    setIsLocaleLoading(true);
    setTimeout(() => setIsLocaleLoading(false), 500);
  }, []);
  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      const newLocale = event.target.value as string;
      setLocale(newLocale);
      startLoading();
      localStorage.setItem("selectedLocale", newLocale);
      appContext?.setLocale(newLocale);
    },
    [setLocale, appContext]
  );

  return (
    <Grid container spacing={1}>
      <Grid item xs={3}>
        <Item>
          <FormControl fullWidth size="small">
            {loading ? (
              <Skeleton variant="rounded" height={60} />
            ) : (
              <div className="text-left">
                <InputLabel id="demo-simple-select-label">Locale</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  //@ts-ignore
                  value={locale}
                  label="Locale"
                  onChange={handleChange}
                  fullWidth
                >
                  {map(folders, (folder) => (
                    <MenuItem value={folder} key={folder}>
                      {folder}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            )}
          </FormControl>

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
            {locale && (
              <List component="nav" aria-label="main mailbox folders">
                <ListItemButton
                  onClick={() => {
                    setFileAvailable(true);
                  }}
                >
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText primary={`Metadata`} />
                </ListItemButton>
              </List>
            )}
            <Divider />
          </Box>
        </Item>
      </Grid>
      <Grid item xs={9}>
        <Item sx={{ maxHeight: "80vh", overflowY: "scroll" }}>
          {isFileAvailable && (
            <>
              {isLocaleLoading ? (
                <Skeleton variant="rounded" height={60} />
              ) : (
                <MetaEditor
                  file={`locales/${locale}/metadata.json`}
                  locale={locale}
                />
              )}
            </>
          )}
        </Item>
      </Grid>
    </Grid>
  );
};

export default Metadata;
