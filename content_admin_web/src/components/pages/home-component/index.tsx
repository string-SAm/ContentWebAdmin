"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ArticleIcon from "@mui/icons-material/Article";
import SendIcon from "@mui/icons-material/Send";
import { ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import { useFirebaseDB } from "@/hooks/useFirebase";
import { OptionCard } from "@/components/common/option-card";
import { map } from "lodash";
import Lock from "@mui/icons-material/Lock";
import LanguageIcon from '@mui/icons-material/Language';
const styles = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "40vw",
  height: "45vh",
  p: 2,
};

const HomeComponent = () => {
  const firebaseDb = useFirebaseDB();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const navigateTo = useCallback(
    (path: string) => () => {
      router.push(`/${path}`);
    },
    []
  );
  // TODO: For future implementation
  // const onChangesFinalize = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const response = await fetch("/api/sendEmail", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email: "",
  //         subject: "Finalize Changes",
  //         message: "Finalize changes request raised",
  //       }),
  //     });

  //     if (response.ok) {
  //       alert("Email sent successfully!");
  //       const result = await set(ref(firebaseDb, `isFinalized`), true);
  //       setLoading(false);
  //     } else {
  //       alert("Failed to send email.");
  //       setLoading(false);
  //     }
  //   } catch (err) {
  //     setLoading(false);
  //   }
  // }, [firebaseDb]);

  const onSendMail = useCallback(async () => {
    const emails = process.env.NEXT_PUBLIC_EMAILS ?? "";

    const projectId = JSON.parse(
      localStorage.getItem("firebase_config") as string
    ).projectId as string;
    const subject = `Finalize Changes Request raised`;
    const body = `Finalize changes request raised by -${projectId} at ${new Date().toDateString()}`;

    const encodedSubject = encodeURIComponent(subject).replace(/%20/g, "+");
    const encodedBody = encodeURIComponent(body).replace(/%20/g, "+");

    const mailto = `mailto:${encodeURIComponent(
      emails
    )}?subject=${encodedSubject}&body=${encodedBody}`;

    // Use window.location to trigger the mail client
    window.location.href = mailto;
  }, []);

  const onChangesFinalize = useCallback(async () => {
    try {
      setLoading(true);
      onSendMail();
      const result = await set(ref(firebaseDb, `isFinalized`), true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }, [firebaseDb]);

  const actions = useMemo(
    () => [
      {
        label: "Branding",
        onClick: navigateTo("branding"),
        icon: ArticleIcon,
        color: "primary",
        disabled: true
      },
      {
        label: "Finalize",
        onClick: onChangesFinalize,
        icon: Lock,
        color: "error",
        disabled: false
      },
      {
        label: "Translations",
        onClick: navigateTo("translations"),
        icon: ArticleIcon,
        color: "info",
        disabled: false
      },
      {
        label :"Update Metadata",
        onClick: navigateTo("metadata"),
        color:"warning",
        disabled: false,
        icon :LanguageIcon
      }
    ],
    [navigateTo, onChangesFinalize]
  );

  return (
    <Container>
      <Card sx={styles}>
        <CardContent>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            className="mb-3"
          >
            Select an option
          </Typography>
         
          <Grid container spacing={2} columns={16}>
            {map(actions, (action) => (
              <OptionCard details={action} />
            ))}
          </Grid>
         
        </CardContent>
      </Card>
    </Container>
  );
};

export default HomeComponent;
