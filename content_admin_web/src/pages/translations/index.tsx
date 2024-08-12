"use client";
import CombinedTranslationEditor from "@/components/translations/combined-translator-editor";
import OptionSelector from "@/components/translations/option-selector";
import TranslationEditor from "@/components/translations/translation-editor";
import { Grid, Paper, styled } from "@mui/material";
import React from "react";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  minHeight: `calc(100vh - 80px)`,
}));

const Translations = () => {
  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <Item>
            <OptionSelector />
          </Item>
        </Grid>
        <Grid item xs={9}>
          <Item>
            {/* <TranslationEditor /> */}
            <CombinedTranslationEditor />
          </Item>
        </Grid>
      </Grid>
    </div>
  );
};

export default Translations;
