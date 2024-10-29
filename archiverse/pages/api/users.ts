import { LINKS, SETTINGS } from "@constants/constants";
import {
  Community,
  getCommunities,
  getPosts,
  searchCommunities,
  searchUsers,
} from "@server/database";
import { logServerStats } from "@server/logger";
import { extractEnglishCharacters } from "@utils/utils";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await logServerStats(req, res)

  if (SETTINGS.Maintenance) {
    return res.status(503).json({
      error: "Archiverse is currently undergoing maintenance. Come back soon!",
    });
  }

  try {
    const search = extractEnglishCharacters(req.query?.search as string);

    if (!search || typeof search !== "string" || search.length < 3 || search.startsWith('_')) {
      return res.status(200).json([]);
    }

    const users = await searchUsers({
      query: search as string,
    });

    return res.status(200).json(users);
  } catch (e) {
    return res.status(500).json({ error: e?.message });
  }
};

export default handler;
