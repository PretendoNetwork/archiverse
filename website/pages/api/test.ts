// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SETTINGS } from "@constants/constants";
import { logServerStats } from "@server/logger";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  logServerStats(req, res);

  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "Not authorized" });
  }

  if (SETTINGS.Maintenance) {
    return res.status(503).json({
      error: "Archiverse is currently undergoing maintenance. Come back soon!",
    });
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Wait for 15 seconds (15000 milliseconds) to respect middleware's timeout
  await wait(40000);

  // Send a response after the wait is over
  res.status(200).json({ message: "Waited for 15 seconds before responding" });
}
