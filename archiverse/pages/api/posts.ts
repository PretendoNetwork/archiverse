import { SETTINGS } from "@constants/constants";
import {
  Community,
  getCommunities,
  getHomepageDrawings,
  getPosts,
  getRandomPosts,
  searchCommunities,
  searchPosts,
} from "@server/database";
import { logServerStats } from "@server/logger";
import type { NextApiRequest, NextApiResponse } from "next";

type QueryParams = {
  homepage?: boolean;
  random?: boolean;
  search?: string;
  user_id?: string;
  sort_mode: "recent" | "popular" | "oldest";
  before_datetime?: string;
  game_id?: string;
  title_id?: string;
  only_drawings?: boolean;
  page?: string | number;
};

const validateQueryParams = (query: QueryParams): string[] => {
  const {
    sort_mode,
    before_datetime,
    user_id,
    game_id,
    title_id,
    page,
    search,
  } = query;

  const errors: string[] = [];
  const sortModes = ["recent", "popular"];
  const sortModesWithUserID = ["recent", "popular", "oldest"];

  if (query.homepage || search || query.random) {
    return []; // just quit early. we don't care about other variables now
  }

  if (user_id && !sortModesWithUserID.includes(sort_mode)) {
    errors.push(
      "Invalid sort_mode with user_id. Must be 'recent', 'popular', or 'oldest'."
    );
  } else if (!user_id && !sortModes.includes(sort_mode)) {
    errors.push("Invalid sort_mode. Must be 'recent' or 'popular'.");
  }

  if (query.only_drawings && sort_mode !== "popular") {
    errors.push("If only_drawings is true, then sort_mode must be 'popular'.");
  }

  if (user_id && (typeof user_id !== "string" || user_id.length === 0)) {
    errors.push("Invalid user_id. Must be a non-empty string.");
  }

  if (before_datetime && isNaN(Date.parse(before_datetime))) {
    errors.push("Invalid before_datetime. Must be a valid date string.");
  }

  if (game_id && (typeof game_id !== "string" || game_id.length === 0)) {
    errors.push("Invalid game_id. Must be a non-empty string.");
  }

  if (title_id && (typeof title_id !== "string" || title_id.length === 0)) {
    errors.push("Invalid title_id. Must be a non-empty string.");
  }

  if (before_datetime && (!game_id || !title_id)) {
    errors.push(
      "If a before_datetime is set, a title_id and game_id must also be set."
    );
  }

  if (page && isNaN(Number(page))) {
    errors.push("Invalid page. Must be a number.");
  }

  if (sort_mode === "recent") {
    if (!(user_id != null || (game_id != null && title_id != null))) {
      errors.push(
        "For sort_mode 'recent', there must be either both game_id and title_id or a user_id."
      );
    }
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
    const {
      title_id,
      search,
      game_id,
      user_id,
      sort_mode,
      before_datetime,
      page,
      only_drawings,
      homepage,
      random,
    } = req.query;

    const queryParams: QueryParams = {
      homepage: homepage === "true",
      random: random === "true",
      title_id: title_id as string,
      game_id: game_id as string,
      sort_mode: sort_mode as "recent" | "popular",
      user_id: user_id as string,
      before_datetime: before_datetime as string,
      page: page as string | number,
      only_drawings: only_drawings === "true",
      search: search as string,
    };

    const errors = validateQueryParams(queryParams);

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    if (homepage === "true") {
      const posts = await getHomepageDrawings();
      return res.status(200).json(posts);
    }

    if (random === "true") {
      const posts = await getRandomPosts();
      return res.status(200).json(posts);
    }

    if (search) {
      const posts = [];
      // const posts = await searchPosts({ query: search as string });
      return res.status(200).json(posts);
    }

    const pageNumber = page ? parseInt(page as string, 10) : 1;
    const beforeDate = before_datetime
      ? new Date(queryParams.before_datetime)
      : null;

    const posts = await getPosts({
      sortMode: queryParams.sort_mode,
      beforeDateTime: beforeDate,
      gameID: queryParams.game_id,
      NNID: queryParams.user_id,
      titleID: queryParams.title_id,
      onlyDrawings: only_drawings === "true",
      page: pageNumber,
    });

    return res.status(200).json(posts);
  } catch (e) {
    return res.status(500).json({ error: e?.message });
  }
};

export default handler;
