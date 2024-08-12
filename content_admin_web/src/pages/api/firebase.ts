import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const filePath: any = req.query.filePath; // Expected to be a encodeURIComponent string

      const response = await fetch(filePath);

      if (response.ok) {
        const responseData = await response.json();
        return res.status(200).json(responseData);
      } else {
        // Forward the status code from Firebase in case of error
        const errorResponse = await response.text(); // Assuming error message is plain text
        return res.status(response.status).json({ error: errorResponse });
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    // Allow only GET requests for this API route
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
