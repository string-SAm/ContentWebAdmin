import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const appsDir = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "./",
        "src",
        "constants",
        "locales"
      );

      const files = fs.readdirSync(appsDir, {
        withFileTypes: true,
        recursive: true,
      });

      res.status(200).json({ message: "Files uploaded successfully!", files });
    } catch (error) {
      console.error("Failed to upload files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  }
}
