// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SETTINGS } from "@constants/constants";
import {
  Community,
  getCommunities,
  getCommunity,
  getPost,
  searchCommunities,
} from "@server/database";
import { logServerStats } from "@server/logger";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await logServerStats(req, res)
  if (SETTINGS.Maintenance) {
    return res.status(503).json({
      error: "Archiverse is currently undergoing maintenance. Come back soon!",
    });
  }
  try {
    const { post_id } = req.query;

    const post = await getPost({ postID: post_id });

    res.status(200).json(post);
  } catch (e) {
    return res.status(500).json({ error: e?.message });
  }
};

export default handler;
