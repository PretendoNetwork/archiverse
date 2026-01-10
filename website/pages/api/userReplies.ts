import { SETTINGS } from "@constants/constants";
import { getUserReplies } from "@server/database";
import { logServerStats } from "@server/logger";
import type { NextApiRequest, NextApiResponse } from "next";

type QueryParams = {
  user_id?: string;
  page?: string | number;
  sort_mode?: "newest" | "oldest" | "popular";
};

const validateQueryParams = (query: QueryParams): string[] => {
  const errors: string[] = [];
  const sortModes = ["newest", "oldest", "popular"];

  if (!query.user_id || typeof query.user_id !== "string" || !query.user_id) {
    errors.push("Invalid user_id. Must be a non-empty string.");
  }

  if (!query.sort_mode || !sortModes.includes(query.sort_mode)) {
    errors.push("Invalid sort_mode. Must be 'newest', 'oldest', or 'popular'.");
  }

  if (query.page && isNaN(Number(query.page))) {
    errors.push("Invalid page. Must be a number.");
  }

  return errors;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await logServerStats(req, res);

  if (SETTINGS.Maintenance) {
    return res.status(503).json({
      error: "Archiverse is currently undergoing maintenance. Come back soon!",
    });
  }

  try {
    const { user_id, page, sort_mode } = req.query;

    const queryParams: QueryParams = {
      user_id: user_id as string,
      page: page as string | number,
      sort_mode: sort_mode as "newest" | "oldest" | "popular",
    };

    const errors = validateQueryParams(queryParams);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    const pageNumber = page ? parseInt(page as string, 10) : 1;

    const replies = await getUserReplies({
      NNID: queryParams.user_id!,
      sortMode: queryParams.sort_mode!,
      page: pageNumber,
    });

    return res.status(200).json(replies);
  } catch (e) {
    return res.status(500).json({ error: e?.message });
  }
};

export default handler;


