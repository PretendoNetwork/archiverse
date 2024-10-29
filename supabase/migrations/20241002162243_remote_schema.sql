set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.clean_search_nnid_query(input text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN regexp_replace(input, '[^a-zA-Z0-9]', '', 'g');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.clean_search_query(input text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN regexp_replace(input, '[^a-zA-Z0-9]', '', 'g');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_hide_status(do_hide boolean, input_nnid text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update the "Users" table
    UPDATE "Users"
    SET "HideRequested" = do_hide
    WHERE "NNID" = input_nnid;

    -- Update the "Posts" table
    UPDATE "Posts"
    SET "HideRequested" = do_hide
    WHERE "NNID" = input_nnid;

    -- Update the "Replies" table
    UPDATE "Replies"
    SET "HideRequested" = do_hide
    WHERE "NNID" = input_nnid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_users_by_nnid(search_query text)
 RETURNS TABLE("NNID" text, "Bio" text, "Birthday" text, "Country" text, "FollowerCount" integer, "FollowingCount" integer, "FriendsCount" integer, "GameSkill" integer, "IconUri" text, "IsBirthdayHidden" boolean, "IsError" boolean, "IsHidden" boolean, "ScreenName" text, "SidebarCoverUrl" text, "TotalPosts" integer, "HideRequested" boolean, "WarcLocation" text)
 LANGUAGE plpgsql
AS $function$BEGIN
    RETURN QUERY
    SELECT u."NNID", u."Bio", u."Birthday", u."Country", u."FollowerCount", u."FollowingCount", u."FriendsCount", u."GameSkill", u."IconUri", u."IsBirthdayHidden", u."IsError", u."IsHidden", u."ScreenName", u."SidebarCoverUrl", u."TotalPosts", u."HideRequested", u."WarcLocation"
    FROM "Users" u
    WHERE u."NNID" ILIKE replace(search_query, '_', '\_') || '%'
    ORDER BY similarity(u."NNID", replace(search_query, '_', '\_')) DESC
    LIMIT 30;
END;$function$
;


