"use client";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { useRouter } from "next/router";
import {
  useFirebaseApp,
  useFirebaseDB,
  useProjectName,
} from "@/hooks/useFirebase";
import { onValue, ref } from "firebase/database";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
};
const HomeMenu = () => {
  const [isUploadLocked, setIsUploadLocked] = useState(false);
  const router = useRouter();
  const firebaseApp = useFirebaseApp();
  const firebaseDb = useFirebaseDB();
  const navigateTo = useCallback(
    (path: string) => () => {
      router.push(`/${path}`);
    },
    []
  );

  const { projectName, loading } = useProjectName();
  const isEditDisabled = loading || !projectName;

  useEffect(() => {
    if (firebaseApp) {
      const finalizedRef = ref(firebaseDb, "isUploadLocked");
      // Set up the listener for the Firebase data
      const unsubscribe = onValue(
        finalizedRef,
        (snapshot) => {
          const isUploadLocked = snapshot.val(); // Assuming 'isFinalized' is a boolean
          setIsUploadLocked(isUploadLocked);
        },
        (error) => {
          console.error("Firebase read failed: ", error);
        }
      );
      // Clean up the listener when the component unmounts or dependencies change
      return () => {
        unsubscribe();
      };
    }
  }, [firebaseApp, setIsUploadLocked, firebaseDb]);

  return (
    <Container>
      <Box className="d-flex justify-content-between  " sx={style}>
        {!isUploadLocked && (
          <Card
            sx={{
              maxWidth: 345,
              p: 2,
              mr: 2,
              backgroundColor: isUploadLocked ? "grey.300" : "background.paper", // Conditionally set background color
              pointerEvents: isUploadLocked ? "none" : "auto",
            }}
            onClick={!isUploadLocked ? navigateTo("upload") : undefined}
            // onClick={navigateTo("upload")}
          >
            <CardActionArea>
              <Box className="text-center">
                <CloudUploadIcon
                  sx={{ fontSize: "60px" }}
                  className="mx-auto text-info"
                />
              </Box>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Upload Data
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You can upload all the necessary data from here
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        )}
        <Card
          sx={{
            maxWidth: 345,
            p: 2,
            mr: 2,
            backgroundColor: isEditDisabled ? "grey.300" : "background.paper", // Conditionally set background color
            pointerEvents: isEditDisabled ? "none" : "auto",
          }}
          onClick={!isEditDisabled ? navigateTo("home") : undefined}
        >
          <CardActionArea disabled={isEditDisabled}>
            <Box className="text-center">
              <ModeEditIcon
                sx={{ fontSize: "60px" }}
                className="mx-auto text-primary"
              />
            </Box>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Update Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You can update all the necessary data from here
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Container>
  );
};

export default HomeMenu;
