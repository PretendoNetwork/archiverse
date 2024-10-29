
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

ALTER SCHEMA "public" OWNER TO "postgres";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "tsm_system_rows" WITH SCHEMA "public";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."game_posts_per_month"("gameid" "text") RETURNS "refcursor"
    LANGUAGE "plpgsql"
    AS $$
 DECLARE
 	ref refcursor;
 BEGIN
  OPEN ref FOR SELECT
		x.timestamp::date AS "Date",
		COUNT(x) as "Total"
		FROM (
    			SELECT 
   				date_trunc('month',TIMESTAMP WITH TIME ZONE 'epoch' + "PostedDate" * INTERVAL '1 second') as timestamp 
    			from public."Posts"
    			WHERE "GameId" = gameId
				) AS x 
			GROUP BY ("Date")
			ORDER BY "Date" ASC;
		RETURN ref;
       END;
       $$;

ALTER FUNCTION "public"."game_posts_per_month"("gameid" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."game_posts_per_month"("gameid" "text", "ref" "refcursor") RETURNS "refcursor"
    LANGUAGE "plpgsql"
    AS $$
 BEGIN
  OPEN ref FOR SELECT
		x.timestamp::date AS "Date",
		COUNT(x) as "Total"
		FROM (
    			SELECT 
   				date_trunc('month',TIMESTAMP WITH TIME ZONE 'epoch' + "PostedDate" * INTERVAL '1 second') as timestamp 
    			from public."Posts"
    			WHERE "GameId" = gameId
				) AS x 
			GROUP BY ("Date")
			ORDER BY "Date" ASC;
		RETURN ref;
       END;
       $$;

ALTER FUNCTION "public"."game_posts_per_month"("gameid" "text", "ref" "refcursor") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."Posts" (
    "Id" "text" NOT NULL,
    "DiscussionType" "text",
    "EmpathyCount" integer NOT NULL,
    "Feeling" integer NOT NULL,
    "GameCommunityIconUri" "text",
    "GameCommunityTitle" "text",
    "GameId" "text",
    "IconUri" "text",
    "ImageUri" "text",
    "IsAcceptingResponse" boolean NOT NULL,
    "IsPlayed" boolean NOT NULL,
    "IsSpoiler" boolean NOT NULL,
    "NNID" "text",
    "PostedDate" bigint NOT NULL,
    "ReplyCount" integer NOT NULL,
    "ScreenName" "text",
    "ScreenShotUri" "text",
    "Text" "text",
    "Title" "text",
    "TitleId" "text",
    "VideoUrl" "text",
    "WarcLocation" "text",
    "HideRequested" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."Posts" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_random_posts"("num_rows" integer) RETURNS SETOF "public"."Posts"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    RETURN QUERY
    (
        SELECT *
        FROM public."Posts"
        TABLESAMPLE SYSTEM_ROWS(1)
    )
    UNION ALL
    (
        SELECT *
        FROM public."Posts"
        TABLESAMPLE SYSTEM_ROWS(1)
    )
    UNION ALL
    (
        SELECT *
        FROM public."Posts"
        TABLESAMPLE SYSTEM_ROWS(1)
    )
    UNION ALL
    (
        SELECT *
        FROM public."Posts"
        TABLESAMPLE SYSTEM_ROWS(1)
    )    
    UNION ALL
    (
        SELECT *
        FROM public."Posts"
        TABLESAMPLE SYSTEM_ROWS(1)
    );
END;$$;

ALTER FUNCTION "public"."get_random_posts"("num_rows" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."search_communities"("search_query" "text") RETURNS TABLE("GameId" "text", "TitleId" "text", "Title" "text", "CommunityBadge" "text", "CommunityListIcon" "text", "IconUri" "text", "Type" "text", "TotalPosts" integer, "ViewRegion" integer)
    LANGUAGE "plpgsql"
    AS $$BEGIN
    RETURN QUERY
    SELECT 
        g."GameId", 
        g."TitleId", 
        g."Title", 
        g."CommunityBadge", 
        g."CommunityListIcon", 
        g."IconUri", 
        g."Type", 
        g."TotalPosts",
        g."ViewRegion"
    FROM "Games" g
    WHERE (g."Title" ILIKE '%' || search_query || '%'
    OR g."Type" ILIKE '%' || search_query || '%')
    AND g."Visible" = TRUE
    ORDER BY similarity(g."Type", search_query) DESC
    LIMIT 35;
END;$$;

ALTER FUNCTION "public"."search_communities"("search_query" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."search_posts"("keyword" "text") RETURNS SETOF "public"."Posts"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    RETURN QUERY
    SELECT *
    FROM "Posts"
    WHERE ("Title" || ' ' || "Text") ILIKE '%' || keyword || '%'
    LIMIT 10;
END;$$;

ALTER FUNCTION "public"."search_posts"("keyword" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."search_users_by_nnid"("search_query" "text") RETURNS TABLE("NNID" "text", "Bio" "text", "Birthday" "text", "Country" "text", "FollowerCount" integer, "FollowingCount" integer, "FriendsCount" integer, "GameSkill" integer, "IconUri" "text", "IsBirthdayHidden" boolean, "IsError" boolean, "IsHidden" boolean, "ScreenName" "text", "SidebarCoverUrl" "text", "TotalPosts" integer, "HideRequested" boolean, "WarcLocation" "text")
    LANGUAGE "plpgsql"
    AS $$BEGIN
    RETURN QUERY
    SELECT u."NNID", u."Bio", u."Birthday", u."Country", u."FollowerCount", u."FollowingCount", u."FriendsCount", u."GameSkill", u."IconUri", u."IsBirthdayHidden", u."IsError", u."IsHidden", u."ScreenName", u."SidebarCoverUrl", u."TotalPosts", u."HideRequested", u."WarcLocation"
    FROM "Users" u
    WHERE u."NNID" ILIKE search_query || '%'
    ORDER BY similarity(u."NNID", search_query) DESC
    LIMIT 10;
END;$$;

ALTER FUNCTION "public"."search_users_by_nnid"("search_query" "text") OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."DeletedPosts" (
    "Id" "text" NOT NULL,
    "GameCommunityIconUri" "text",
    "GameCommunityTitle" "text",
    "GameId" "text",
    "IconUri" "text",
    "InReplyToId" "text",
    "NNID" "text",
    "ScreenName" "text",
    "Title" "text",
    "TitleId" "text",
    "WarcLocation" "text"
);

ALTER TABLE "public"."DeletedPosts" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."Games" (
    "Id" integer NOT NULL,
    "CommunityBadge" "text",
    "CommunityListIcon" "text",
    "GameId" "text" NOT NULL,
    "IconUri" "text",
    "Platform" integer NOT NULL,
    "Title" "text",
    "TitleId" "text" NOT NULL,
    "TitleUrl" "text",
    "Type" "text",
    "ViewRegion" integer NOT NULL,
    "TotalDeletedPosts" integer DEFAULT 0 NOT NULL,
    "TotalPosts" integer DEFAULT 0 NOT NULL,
    "TotalReplies" integer DEFAULT 0 NOT NULL,
    "Visible" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."Games" OWNER TO "postgres";

COMMENT ON COLUMN "public"."Games"."Visible" IS 'Some Rows here seem to point to nonsense with no posts. This column being false makes the community not visible on the communities tab or search';

CREATE SEQUENCE IF NOT EXISTS "public"."Games_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."Games_Id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."Games_Id_seq" OWNED BY "public"."Games"."Id";

CREATE TABLE IF NOT EXISTS "public"."Replies" (
    "Id" "text" NOT NULL,
    "DiscussionType" "text",
    "EmpathyCount" integer NOT NULL,
    "Feeling" integer NOT NULL,
    "GameCommunityIconUri" "text",
    "GameCommunityTitle" "text",
    "GameId" "text",
    "IconUri" "text",
    "ImageUri" "text",
    "InReplyToId" "text",
    "IsAcceptingResponse" boolean NOT NULL,
    "IsPlayed" boolean NOT NULL,
    "IsSpoiler" boolean NOT NULL,
    "NNID" "text",
    "PostedDate" bigint NOT NULL,
    "ReplyCount" integer NOT NULL,
    "ScreenName" "text",
    "ScreenShotUri" "text",
    "Text" "text",
    "Title" "text",
    "TitleId" "text",
    "VideoUrl" "text",
    "WarcLocation" "text",
    "HideRequested" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."Replies" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."Users" (
    "Id" integer NOT NULL,
    "Bio" "text",
    "Birthday" "text",
    "Country" "text",
    "EmpathyCount" integer NOT NULL,
    "FavoriteGameGenres" "text",
    "FollowerCount" integer NOT NULL,
    "FollowingCount" integer NOT NULL,
    "FriendsCount" integer NOT NULL,
    "GameSkill" integer NOT NULL,
    "GameSystem" "text",
    "IconUri" "text",
    "IsBirthdayHidden" boolean NOT NULL,
    "IsError" boolean NOT NULL,
    "IsHidden" boolean NOT NULL,
    "NNID" "text" NOT NULL,
    "ScreenName" "text",
    "SidebarCoverUrl" "text",
    "TotalPosts" integer NOT NULL,
    "WarcLocation" "text",
    "TotalDeletedPosts" integer DEFAULT 0 NOT NULL,
    "TotalReplies" integer DEFAULT 0 NOT NULL,
    "HideRequested" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."Users" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."Users_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."Users_Id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."Users_Id_seq" OWNED BY "public"."Users"."Id";

ALTER TABLE ONLY "public"."Games" ALTER COLUMN "Id" SET DEFAULT "nextval"('"public"."Games_Id_seq"'::"regclass");

ALTER TABLE ONLY "public"."Users" ALTER COLUMN "Id" SET DEFAULT "nextval"('"public"."Users_Id_seq"'::"regclass");

ALTER TABLE ONLY "public"."DeletedPosts"
    ADD CONSTRAINT "DeletedPosts_pkey" PRIMARY KEY ("Id");

ALTER TABLE ONLY "public"."Games"
    ADD CONSTRAINT "Games_pkey" PRIMARY KEY ("TitleId", "GameId");

ALTER TABLE ONLY "public"."Posts"
    ADD CONSTRAINT "Posts_pkey" PRIMARY KEY ("Id");

ALTER TABLE ONLY "public"."Replies"
    ADD CONSTRAINT "Replies_pkey" PRIMARY KEY ("Id");

ALTER TABLE ONLY "public"."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("NNID");

CREATE INDEX "Games_TitleId_idx" ON "public"."Games" USING "btree" ("TitleId");

CREATE INDEX "Games_TotalPosts_desc_idx" ON "public"."Games" USING "btree" ("TotalPosts" DESC);

CREATE INDEX "Games_Visible_idx" ON "public"."Games" USING "btree" ("Visible");

CREATE INDEX "Replies_InReplyToId_idx" ON "public"."Replies" USING "btree" ("InReplyToId");

CREATE INDEX "Replies_NNID_idx" ON "public"."Replies" USING "btree" ("NNID");

CREATE INDEX "Replies_PostedDate_idx_asc" ON "public"."Replies" USING "btree" ("PostedDate");

CREATE INDEX "games_title_idx" ON "public"."Games" USING "gin" ("Title" "public"."gin_trgm_ops");

CREATE INDEX "games_type_idx" ON "public"."Games" USING "gin" ("Type" "public"."gin_trgm_ops");

CREATE INDEX "idx_posts_empathy_image_nnid" ON "public"."Posts" USING "btree" ("EmpathyCount", "ImageUri", "NNID");

CREATE INDEX "nnid_users_idx" ON "public"."Users" USING "gin" ("NNID" "public"."gin_trgm_ops");

CREATE INDEX "post_title_text_idx_search" ON "public"."Posts" USING "gin" (((("Title" || ' '::"text") || "Text")) "public"."gin_trgm_ops");

CREATE INDEX "posts_common_empathycount_posteddate_idx" ON "public"."Posts" USING "btree" ("GameId", "TitleId", "EmpathyCount" DESC, "PostedDate" DESC);

CREATE INDEX "posts_common_idx" ON "public"."Posts" USING "btree" ("GameId", "TitleId", "PostedDate" DESC, "EmpathyCount" DESC);

CREATE INDEX "posts_nnid_empathycount_posteddate_idx" ON "public"."Posts" USING "btree" ("NNID", "EmpathyCount" DESC, "PostedDate" DESC);

CREATE INDEX "posts_nnid_posteddate_empathycount_idx" ON "public"."Posts" USING "btree" ("NNID", "PostedDate" DESC, "EmpathyCount" DESC);

ALTER TABLE ONLY "public"."Replies"
    ADD CONSTRAINT "Replies_InReplyToId_fkey" FOREIGN KEY ("InReplyToId") REFERENCES "public"."Posts"("Id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."DeletedPosts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Games" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Replies" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Users" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";

GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";

GRANT ALL ON FUNCTION "public"."game_posts_per_month"("gameid" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."game_posts_per_month"("gameid" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."game_posts_per_month"("gameid" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."game_posts_per_month"("gameid" "text", "ref" "refcursor") TO "anon";
GRANT ALL ON FUNCTION "public"."game_posts_per_month"("gameid" "text", "ref" "refcursor") TO "authenticated";
GRANT ALL ON FUNCTION "public"."game_posts_per_month"("gameid" "text", "ref" "refcursor") TO "service_role";

GRANT ALL ON TABLE "public"."Posts" TO "anon";
GRANT ALL ON TABLE "public"."Posts" TO "authenticated";
GRANT ALL ON TABLE "public"."Posts" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_random_posts"("num_rows" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_random_posts"("num_rows" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_posts"("num_rows" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."search_communities"("search_query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_communities"("search_query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_communities"("search_query" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."search_posts"("keyword" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_posts"("keyword" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_posts"("keyword" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."search_users_by_nnid"("search_query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_users_by_nnid"("search_query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_users_by_nnid"("search_query" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";

GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";

GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";

GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."system_rows"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."system_rows"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."system_rows"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."system_rows"("internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";

GRANT ALL ON TABLE "public"."DeletedPosts" TO "anon";
GRANT ALL ON TABLE "public"."DeletedPosts" TO "authenticated";
GRANT ALL ON TABLE "public"."DeletedPosts" TO "service_role";

GRANT ALL ON TABLE "public"."Games" TO "anon";
GRANT ALL ON TABLE "public"."Games" TO "authenticated";
GRANT ALL ON TABLE "public"."Games" TO "service_role";

GRANT ALL ON SEQUENCE "public"."Games_Id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Games_Id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Games_Id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."Replies" TO "anon";
GRANT ALL ON TABLE "public"."Replies" TO "authenticated";
GRANT ALL ON TABLE "public"."Replies" TO "service_role";

GRANT ALL ON TABLE "public"."Users" TO "anon";
GRANT ALL ON TABLE "public"."Users" TO "authenticated";
GRANT ALL ON TABLE "public"."Users" TO "service_role";

GRANT ALL ON SEQUENCE "public"."Users_Id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Users_Id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Users_Id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
