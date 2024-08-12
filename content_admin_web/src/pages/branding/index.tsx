import ConstantFileSelector from "@/components/branding/constant-selector";
import JsonEditor from "@/components/branding/json-editor";
import { Container, Grid, Paper, styled } from "@mui/material";
import React, { useCallback, useState } from "react";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  minHeight: `calc(100vh - 80px)`
}));
const Brandings = () => {
  const [activeFile, setActiveFile] = useState(null);

  const onSetFile=useCallback((file:any)=>{
   setActiveFile(file)
  },[])
  return (
    <div>
      <Grid container spacing={1} >
        <Grid item xs={3}>
          <Item>
            <ConstantFileSelector onSetFile={onSetFile}/>
          </Item>
        </Grid>
        <Grid item xs={9}>
          <Item>
            <JsonEditor file={activeFile} onSetFile={onSetFile} />
          </Item>
        </Grid>
      </Grid>
    </div>
  );
};

export default Brandings;
