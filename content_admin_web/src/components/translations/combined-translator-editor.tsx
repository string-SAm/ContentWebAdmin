"use client";
import { AppContext } from "@/context";
import { useProjectName } from "@/hooks/useFirebase";
import { splitCapitalizeAndRemoveExtension } from "@/utils/split-and-capitalize";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Breadcrumbs,
  Divider,
  Typography,
} from "@mui/material";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { filter, map } from "lodash";
import EditIcon from "@mui/icons-material/Edit";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import JsonEditor from "../common/json-editor";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FullContentLoader from "../common/full-content-loader";
export interface JsonData {
  [key: string]: any;
}

const CombinedTranslationEditor = () => {
  const appContext = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const { projectName } = useProjectName();
  const { activeDictionary } = appContext;
  const disctionaryToShow = useMemo(
    () => filter(activeDictionary?.dictionary, (item) => item !== "common"),
    [activeDictionary]
  );

  useEffect(()=>{
    setLoading(true);
    setTimeout(()=>{
      setLoading(false);},300)
  },[disctionaryToShow])

  return (
    <div className="p-2">
      {activeDictionary ? (
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
                <ArticleIcon /> {activeDictionary?.title}
              </span>
            </Breadcrumbs>
            {/* 
            <Box className="text-right">
              <Tooltip title={"Click to enable edit"}>
                <IconButton aria-label="delete" onClick={onEnableEdit}>
                  <EditIcon color="info" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Click to save">
                <IconButton
                  //  onClick={saveChanges}
                  //disabled={isDisabled || !isSendEnable}
                  disabled={isDisabled}
                >
                  {isAutoSave ? (
                    <CachedIcon color="info" />
                  ) : (
                    <SaveIcon
                    // color={
                    //   isDisabled || !isSendEnable ? "disabled" : "success"
                    // }
                    />
                  )}
                </IconButton>
              </Tooltip>
            </Box> */}
          </Box>

          <Box sx={{ maxHeight: "80vh", overflowY: "scroll" }}>
            {map(disctionaryToShow, (item) => {
              return (
                <>
                  <Divider />
                  <Accordion defaultExpanded>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                    >
                      <Typography>
                        {splitCapitalizeAndRemoveExtension(item)}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    {loading ? <FullContentLoader /> :  <JsonEditor
                        file={`locales/${appContext?.locale}/${item}.json`}
                      />}
                    </AccordionDetails>
                  </Accordion>
                </>
              );
            })}
          </Box>
        </Box>
      ) : (
        <Box className="text-left">
          <Typography variant="h5" component="h2">
            No Page Selected
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default CombinedTranslationEditor;
