import React, {
  useState,
  useContext,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  FormControl,
  Skeleton,
  Box,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import LockIcon from "@mui/icons-material/Lock";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import {
  useFileLocks,
  useGetTranslationJson,
  useVariableValue,
} from "@/hooks/useFirebase";
import { filter, map, sortBy } from "lodash";
import { AppContext } from "@/context";
import { FOLDER_TYPE } from "@/types";



interface RouteItem {
  url: string;
  dictionary: string[];
  title: string;
  id: number;
  mapping: Record<string, any>;
}

interface Lock {
  user: string;
  selectedFile: string;
}

interface NestedFolderListProps {
  locale: string;
}

const NestedFolderList: React.FC<NestedFolderListProps> = ({ locale }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const appContext = useContext(AppContext);
  const { locks } = useFileLocks();
  const {value : hoastedURL} = useVariableValue('hoastedURL');
  const initUrl = useMemo(() => process.env.NODE_ENV === 'development' ? `http://localhost:3000/${locale}` : hoastedURL, [locale,hoastedURL]);
  
  const [dictionaries, setDictionaries] = useState<RouteItem[] | null>(null);
  const { translationData, loading } = useGetTranslationJson(
    "mapping/dictionaryMappings.json"
  );

  useEffect(() => {
    if (translationData && !dictionaries) {
      const nonNullFiles = filter(
        translationData,
        (data: RouteItem) => data?.dictionary !== null
      );
      setDictionaries(nonNullFiles);
    }
  }, [translationData, dictionaries]);

  const checkFileDisable = useCallback(
    (path: RouteItem): boolean => {
      if (!locale) return true;
      const pathsToCheck = path.dictionary.map(
        (item) => `${FOLDER_TYPE.LOCALES}/${locale}/${item}.json`
      );
      return pathsToCheck.some((filePath) => {
        const lock = locks?.find(
          (lock: Lock) => lock.selectedFile === filePath
        );
        return lock && lock.user !== appContext.userId;
      });
    },
    [locks, locale, appContext.userId]
  );

  const handleClick = useCallback(
    (route: RouteItem) => {
      if (!appContext.isEditable) {
        appContext.setActiveDictionary(route);
        setSelected(route.id);
      } else {
        appContext.showSnackbar({
          open: true,
          content:
            "You must save the current dictionary before selecting another.",
          type: "error",
        });
      }
    },
    [appContext]
  );

  const sortedDictionaries = useMemo(
    () => sortBy(dictionaries, ["title"]),
    [dictionaries]
  );
  const openPage = useCallback(
    (url: string) => () => window.open(`${initUrl}${url}`, "_blank"),
    [initUrl]
  );

  const isComponentFetching = useMemo(
    () => !translationData,
    [translationData]
  );

  const getListItems = useCallback(() => {
    if (dictionaries && dictionaries.length > 0) {
      return map(sortedDictionaries, (route: RouteItem, index: number) => (
        <Box key={index} className="p-0">
          <ListItem
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="url"
                onClick={openPage(route.url)}
              >
                <OpenInBrowserIcon />
              </IconButton>
            }
          >
            <ListItemButton
              onClick={() => handleClick(route)}
              selected={selected === route.id}
              disabled={checkFileDisable(route)}
            >
              <ListItemIcon>
                {checkFileDisable(route) ? <LockIcon /> : <FolderIcon />}
              </ListItemIcon>
              <ListItemText primary={route.title} />
            </ListItemButton>
          </ListItem>
        </Box>
      ));
    }
    return [];
  }, [
    dictionaries,
    sortedDictionaries,
    selected,
    checkFileDisable,
    openPage,
    handleClick,
  ]);

  return (
    <div className="w-100">
      <FormControl fullWidth size="small">
        {isComponentFetching ? (
          Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} variant="rounded" height={60} className="mt-2" />
          ))
        ) : (
          <List
            component="nav"
            aria-labelledby="nested-list-subheader"
            className="p-0"
          >
            {getListItems()}
          </List>
        )}
      </FormControl>
    </div>
  );
};

export default NestedFolderList;
