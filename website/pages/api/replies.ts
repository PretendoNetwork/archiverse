import { SETTINGS } from "@constants/constants";
import {
  Community,
  getCommunities,
  getHomepageDrawings,
  getPostReplies,
  getPosts,
  searchCommunities,
} from "@server/database";
import { logServerStats } from "@server/logger";
import type { NextApiRequest, NextApiResponse } from "next";

type QueryParams = {
  post_id: string;
  page: number | string;
  sort_mode: "newest" | "oldest";
};

const validateQueryParams = (query: QueryParams): string[] => {
  const { sort_mode, post_id, page } = query;

  const errors: string[] = [];
  const sortModes = ["newest", "oldest"];

  if (!sortModes.includes(sort_mode)) {
    errors.push("Invalid sort_mode. Must be 'newest' or 'oldest'.");
  }

  if (!post_id || typeof post_id !== "string" || post_id.length === 0) {
    errors.push("Invalid post_id. Must be a non-empty string.");
  }

  if (page && isNaN(Number(page))) {
    errors.push("Invalid page. Must be a number.");
  }

  return errors;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await logServerStats(req, res)

  if (SETTINGS.Maintenance) {
    return res.status(503).json({
      error: "Archiverse is currently undergoing maintenance. Come back soon!",
    });
  }
  
  try {
    const { post_id, page, sort_mode } = req.query;

    const queryParams: QueryParams = {
      post_id: post_id as string,
      page: page as string | number,
      sort_mode: sort_mode as "newest" | "oldest",
    };

    const errors = validateQueryParams(queryParams);

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    const pageNumber = page ? parseInt(page as string, 10) : 1;

    const replies = await getPostReplies({
      sortMode: queryParams.sort_mode,
      postID: post_id as string,
      page: pageNumber,
    });

    return res.status(200).json(replies);
  } catch (e) {
    return res.status(500).json({ error: e?.message });
  }
};

export default handler;
