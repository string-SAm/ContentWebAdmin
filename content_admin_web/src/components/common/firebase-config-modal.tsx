"use client";
import { useFirebase } from "@/hooks/useFirebase";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { TextareaAutosize } from "@mui/material";
import JsonValidator from "ajv";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "40vw",.env
  minHeight: "40vh",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
interface ConfigModalProps {
  onClose: () => void;
  open: boolean;
  setConfigLoaded: (value: boolean) => void;
}

const schema = {
  type: "object",
  properties: {
    apiKey: { type: "string", pattern: "AIza[0-9A-Za-z_-]{33}" },
    authDomain: {
      type: "string",
      pattern: "^[a-zA-Z0-9-]+\\.firebaseapp\\.com$",
    },
    projectId: { type: "string", minLength: 1 },
    storageBucket: {
      type: "string",
      pattern: "^[a-zA-Z0-9-]+\\.appspot\\.com$",
    },
    messagingSenderId: { type: "string", pattern: "^[0-9]+$" },
    appId: { type: "string", pattern: "^1:[0-9]+:[a-z0-9]+:[0-9a-f]+$" },
    measurementId: { type: "string", pattern: "^G-[A-Z0-9]+$" },
  },
  required: [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
    "measurementId",
  ],
  additionalProperties: true, // This ensures no extra properties are allowed
};

const ConfigModal: React.FC<ConfigModalProps> = ({
  onClose,
  open,
  setConfigLoaded,
}) => {
  const { initializeFirebase } = useFirebase();
  const [error, setError] = useState(null);
  const [config, setConfig] = useState<string>("");
  const placeholder = {
    apiKey: "your api key",
    authDomain: "your auth domain",
    projectId: "your api key",
    storageBucket: "your storage bucket",
    messagingSenderId: "your messagingSender Id",
    appId: "your appId",
    measurementId: "measurementId",
  };

  useEffect(() => {
    if (localStorage.getItem("firebase_config")) {
      initializeFirebase(
        JSON.parse(localStorage.getItem("firebase_config") as string)
      );
      onClose();
    }
  }, []);

  const validateFirebaseConfig = (config: any) => {
    const jv = new JsonValidator();
    const validate = jv.compile<any>(schema);
    const valid = validate(config);
    if (!valid) {
      //@ts-ignore
      setError(validate.errors);
      return false;
    }
    return true;
  };
  useEffect(() => {
    const readFromEnv = process.env.NEXT_PUBLIC_READ_FROM_ENV ?? false;
    console.log(readFromEnv);

    if (readFromEnv) {
      const envConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId:
          process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
      };
      initializeFirebase(envConfig);
      localStorage.setItem("firebase_config", JSON.stringify(envConfig));
      setConfigLoaded(true);
      onClose();
    }
  }, [initializeFirebase, onClose]);
  const handleSave = () => {
    try {
      const parsedConfig = JSON.parse(config);
      const isValid = validateFirebaseConfig(JSON.parse(config));
      if (isValid) {
        initializeFirebase(parsedConfig);
        onClose();
      } else {
        alert("error");
      }
    } catch (error) {
      alert("Invalid configuration. Please enter a valid JSON.");
      //@ts-ignore
      setError({ error: error?.message ?? error });
    }
  };

  return (
    <Modal
      open={open}
      // onClose={handleSave}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Paste Your Firebase Configuration
        </Typography>
        <TextareaAutosize
          className="form-control w-100"
          onChange={(e) => setConfig(e.target.value)}
          placeholder={JSON.stringify(placeholder, null, 2)}
        />
        {error && (
          <p className="text-danger">{JSON.stringify(error, null, 2)}</p>
        )}
        <Box className="text-right mt-2">
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfigModal;
