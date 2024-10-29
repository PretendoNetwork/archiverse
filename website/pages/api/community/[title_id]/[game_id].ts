// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SETTINGS } from "@constants/constants";
import {
  Community,
  getCommunities,
  getCommunity,
  searchCommunities,
} from "@server/database";
import { logServerStats } from "@server/logger";
import type { NextApiRequest, NextApiResponse } from "next";

type QueryParams = {
  title_id?: string;
  game_id?: string;
};

const validateQueryParams = (query: QueryParams) => {
  const parsedTitleId = parseInt(query.title_id);
  const parsedGameId = parseInt(query.game_id);
  if (
    isNaN(parsedTitleId) ||
    !Number.isInteger(parsedTitleId) ||
    isNaN(parsedGameId) ||
    !Number.isInteger(parsedGameId)
  ) {
    return false;
  }

  return true;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await logServerStats(req, res)
  if (SETTINGS.Maintenance) {
    return res.status(503).json({
      error: "Archiverse is currently undergoing maintenance. Come back soon!",
    });
  }
  try {
    const { title_id, game_id } = req.query;

    const queryParams: QueryParams = {
      title_id: title_id as string,
      game_id: game_id as string,
    };

    if (!validateQueryParams(queryParams)) {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    const community = await getCommunity({
      gameID: game_id as string,
      titleID: title_id as string,
    });

    res.status(200).json(community);
  } catch (e) {
    return res.status(500).json({ error: e?.message });
  }
};

export default handler;
