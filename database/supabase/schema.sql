

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


CREATE SCHEMA IF NOT EXISTS "public";


CREATE OR REPLACE FUNCTION "public"."clean_search_nnid_query"("input" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN regexp_replace(input, '[^a-zA-Z0-9]', '', 'g');
END;
$$;


CREATE OR REPLACE FUNCTION "public"."clean_search_query"("input" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN regexp_replace(input, '[^a-zA-Z0-9]', '', 'g');
END;
$$;


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


CREATE OR REPLACE FUNCTION "public"."search_posts"("keyword" "text") RETURNS SETOF "public"."Posts"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    RETURN QUERY
    SELECT *
    FROM "Posts"
    WHERE ("Title" || ' ' || "Text") ILIKE '%' || keyword || '%'
    LIMIT 10;
END;$$;


CREATE OR REPLACE FUNCTION "public"."search_users_by_nnid"("search_query" "text") RETURNS TABLE("NNID" "text", "Bio" "text", "Birthday" "text", "Country" "text", "FollowerCount" integer, "FollowingCount" integer, "FriendsCount" integer, "GameSkill" integer, "IconUri" "text", "IsBirthdayHidden" boolean, "IsError" boolean, "IsHidden" boolean, "ScreenName" "text", "SidebarCoverUrl" "text", "TotalPosts" integer, "HideRequested" boolean, "WarcLocation" "text")
    LANGUAGE "plpgsql"
    AS $$BEGIN
    RETURN QUERY
    SELECT u."NNID", u."Bio", u."Birthday", u."Country", u."FollowerCount", u."FollowingCount", u."FriendsCount", u."GameSkill", u."IconUri", u."IsBirthdayHidden", u."IsError", u."IsHidden", u."ScreenName", u."SidebarCoverUrl", u."TotalPosts", u."HideRequested", u."WarcLocation"
    FROM "Users" u
    WHERE u."NNID" ILIKE replace(search_query, '_', '\_') || '%'
    ORDER BY similarity(u."NNID", replace(search_query, '_', '\_')) DESC
    LIMIT 30;
END;$$;


CREATE OR REPLACE FUNCTION "public"."update_hide_status"("do_hide" boolean, "input_nnid" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE "Users"
    SET "HideRequested" = do_hide
    WHERE "NNID" = input_nnid;

    UPDATE "Posts"
    SET "HideRequested" = do_hide
    WHERE "NNID" = input_nnid;

    UPDATE "Replies"
    SET "HideRequested" = do_hide
    WHERE "NNID" = input_nnid;
END;
$$;


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


CREATE SEQUENCE IF NOT EXISTS "public"."Games_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


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


CREATE SEQUENCE IF NOT EXISTS "public"."Users_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


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


ALTER TABLE ONLY "public"."Replies"
    ADD CONSTRAINT "Replies_InReplyToId_fkey" FOREIGN KEY ("InReplyToId") REFERENCES "public"."Posts"("Id") ON UPDATE CASCADE ON DELETE CASCADE;


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
