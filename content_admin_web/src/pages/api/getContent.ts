// pages/api/readFile.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract filePath from query parameters and ensure it's a string
  if (req.method === "POST") {
    const { filePath } = JSON.parse(req.body);

    if (typeof filePath !== "string") {
      res.status(400).json({ message: "Invalid file path provided" });
      return;
    }

    const basePath = path.join(process.cwd(), "src"); // Base directory for files
    const safeFilePath = path.join(
      basePath,
      path.normalize(filePath).replace(/^(\.\.[\/\\])+/, "")
    );

    try {
      if (!fs.existsSync(safeFilePath)) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      const data = fs.readFileSync(safeFilePath, "utf8");

      res.status(200).send(data);
    } catch (error) {
      console.error("Failed to read file:", error);
      res.status(500).json({ message: "Failed to read file" });
    }
  }
}
