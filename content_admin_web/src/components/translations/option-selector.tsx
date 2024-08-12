"use client";
import {
  useFileLocks,
  useFirebaseDB,
  useGetLocaleFolders,
} from "@/hooks/useFirebase";
import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
} from "@mui/material";
import React, { useCallback, useContext, useEffect } from "react";
import { filter, map } from "lodash";
import { AppContext } from "@/context";
import isExpired from "@/utils/is-expired";
import { ref, set } from "firebase/database";
import NestedFolderList from "../common/nested-folders";

type LockType = { user: string; selectedFile: string; timestamp: number };

const OptionSelector = () => {
  const [locale, setLocale] = React.useState<any>(null);
  const appContext = useContext(AppContext);
  const firebaseDb = useFirebaseDB();
  const { locks } = useFileLocks();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localeFromStorage = localStorage.getItem("selectedLocale") || null;
      if (localeFromStorage) {
        setLocale(localeFromStorage);
        appContext?.setLocale(localeFromStorage);
      }
    }
  }, [window]);

  const { folders, loading, error } = useGetLocaleFolders();

  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      const newLocale = event.target.value as string;
      setLocale(newLocale);
      localStorage.setItem("selectedLocale", newLocale); // Save locale to localStorage
      appContext?.setLocale(newLocale);
    },
    [appContext]
  );

  useEffect(() => {
    const updateLocks = async () => {
      if (locks) {
        const expired = filter(locks, (lock: any) => isExpired(lock.timestamp));

        if (expired?.length > 0) {
          const activeLocks = filter(
            locks,
            (lock: LockType) => !isExpired(lock.timestamp)
          );
          try {
            await set(ref(firebaseDb, "locks/userList"), activeLocks);
          } catch (error) {
            console.error("Error updating locks:", error);
          }
        }
      }
    };

    updateLocks();
  }, [locks]);

  if (error)
    return (
      <>
        <h6 className="text-danger">{error}</h6>
      </>
    );

  return (
    <div>
      <FormControl fullWidth size="small">
        {loading ? (
          <Skeleton variant="rounded" height={60} />
        ) : (
          <div className="text-left">
            <InputLabel id="demo-simple-select-label">Locale</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
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
        {false ? (
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
              // maxWidth: 360,
              bgcolor: "background.paper",
              overflowY: "scroll",
              overflowX: "auto",
              marginTop: "10px",
              textAlign: "left",
            }}
          >
            <NestedFolderList locale={locale} />
            <Divider />
          </Box>
        )}
      </FormControl>
    </div>
  );
};

export default OptionSelector;
