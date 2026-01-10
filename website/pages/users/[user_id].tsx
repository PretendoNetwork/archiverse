import SEO from "@/components/SEO";
import Link from "next/link";
import { Post, Reply, User, getUserInfo } from "@server/database";
import { numberWithCommas } from "@utils/utils";
import Loading from "@components/Loading";
import LoadOrRetry from "@components/LoadOrRetry";
import Wrapper from "@components/Wrapper";
import { useEffect, useRef, useState } from "react";
import { queryAPI } from "@utils/queryAPI";
import { IMAGES, LIMIT } from "@constants/constants";
import PostCard from "@components/PostCard";
import { usePageCache } from "@hooks/usePageCache";
import AdBanner from "@components/AdBanner";
import { logServerStats } from "@server/logger";
import ReplyCard from "@components/ReplyCard";
import { useRouter } from "next/router";

type UserReplyFeedItem = { reply: Reply; post: Post | null };

export default function Home({
  user,
  user_id,
  viewParamProvided,
  initialView,
}: {
  user: User;
  user_id: string;
  viewParamProvided: boolean;
  initialView: "posts" | "replies";
}) {
  const { pageCache, cachePageData } = usePageCache();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [contentView, setContentView] = useState<"posts" | "replies">(
    viewParamProvided
      ? initialView
      : pageCache(`users/${user_id}`, "contentView") ?? "posts"
  );

  const [selected, setSelected] = useState<"recent" | "popular" | "oldest">(
    pageCache(`users/${user_id}`, "selected") ?? "recent"
  );

  const [replySelected, setReplySelected] = useState<
    "newest" | "popular" | "oldest"
  >(pageCache(`users/${user_id}`, "replySelected") ?? "newest");

  const [showMore, setShowMore] = useState(
    pageCache(`users/${user_id}`, "showMore") ?? false
  );

  const initialPostsState = {
    data: [] as Post[],
    fetching: true,
    error: null,
    currPage: 1,
    canLoadMore: true,
  };

  const initialRepliesState = {
    data: [] as UserReplyFeedItem[],
    fetching: true,
    error: null,
    currPage: 1,
    canLoadMore: true,
  };

  const [posts, setPosts] = useState<{
    data: Post[];
    fetching: boolean;
    error: string;
    currPage: number;
    canLoadMore: boolean;
  }>(
    pageCache(`users/${user_id}`, "posts") ?? {
      ...initialPostsState,
    }
  );

  const [replies, setReplies] = useState<{
    data: UserReplyFeedItem[];
    fetching: boolean;
    error: string;
    currPage: number;
    canLoadMore: boolean;
  }>(
    pageCache(`users/${user_id}`, "replies") ?? {
      ...initialRepliesState,
    }
  );

  const fetchPosts = async ({
    restart,
    ignoreLoading,
  }: {
    restart?: boolean;
    ignoreLoading?: boolean;
  }) => {
    if (posts.fetching && !ignoreLoading) {
      return;
    }
    var page = posts.currPage + 1;
    if (restart) {
      setPosts((prevState) => ({
        ...prevState,
        data: [],
        fetching: true,
        canLoadMore: true,
        error: null,
      }));
      page = 1;
    } else {
      setPosts((prevState) => ({
        ...prevState,
        fetching: true,
        canLoadMore: true,
        error: null,
      }));
    }
    var queryUrl = `posts?user_id=${user.NNID}&page=${page}&sort_mode=${selected}`;

    const { data, error } = await queryAPI<Post[]>(queryUrl);

    if (error && page > 1) {
      page = page - 1;
    }

    if (error) {
      setPosts((prevState) => ({
        ...prevState,
        fetching: false,
        error: error,
        currPage: page,
      }));
    } else if (restart) {
      setPosts({
        data: data,
        fetching: false,
        error: error,
        currPage: page,
        canLoadMore: data.length === LIMIT.Posts,
      });
    } else {
      setPosts((prevState) => ({
        ...prevState,
        fetching: false,
        error: null,
        currPage: page,
        data: prevState.data.concat(data),
        canLoadMore: data.length === LIMIT.Posts,
      }));
    }
  };

  const fetchReplies = async ({
    restart,
    ignoreLoading,
  }: {
    restart?: boolean;
    ignoreLoading?: boolean;
  }) => {
    if (replies.fetching && !ignoreLoading) {
      return;
    }
    let page = replies.currPage + 1;
    if (restart) {
      setReplies((prevState) => ({
        ...prevState,
        data: [],
        fetching: true,
        canLoadMore: true,
        error: null,
      }));
      page = 1;
    } else {
      setReplies((prevState) => ({
        ...prevState,
        fetching: true,
        canLoadMore: true,
        error: null,
      }));
    }

    const queryUrl = `userReplies?user_id=${user.NNID}&page=${page}&sort_mode=${replySelected}&include_post=true`;
    const { data, error } = await queryAPI<UserReplyFeedItem[]>(queryUrl);

    if (error && page > 1) {
      page = page - 1;
    }

    if (error) {
      setReplies((prevState) => ({
        ...prevState,
        fetching: false,
        error: error,
        currPage: page,
      }));
    } else if (restart) {
      setReplies({
        data: data,
        fetching: false,
        error: error,
        currPage: page,
        canLoadMore: data.length === LIMIT.UserReplies,
      });
    } else {
      setReplies((prevState) => ({
        ...prevState,
        fetching: false,
        error: null,
        currPage: page,
        data: prevState.data.concat(data),
        canLoadMore: data.length === LIMIT.UserReplies,
      }));
    }
  };

  const getButtonStyles = (isSelected: boolean) => {
    const commonStyles =
      "w-1/2 text-left p-2 md:text-sm text-xs font-semibold border-gray hover:brightness-95";
    if (isSelected) {
      return (
        commonStyles +
        " bg-gradient-to-b from-[#81e52e] to-[#5ac800] text-white"
      );
    }
    return (
      commonStyles +
      " bg-gradient-to-b from-white text-neutral-600 to-neutral-200"
    );
  };

  const displayDashIfZero = (number) => {
    if (!number) {
      return "-";
    }
    return "" + number;
  };

  useEffect(() => {
    cachePageData(`users/${user_id}`, "contentView", contentView);
    cachePageData(`users/${user_id}`, "selected", selected);
    cachePageData(`users/${user_id}`, "replySelected", replySelected);
    cachePageData(`users/${user_id}`, "showMore", showMore);
    cachePageData(`users/${user_id}`, "posts", posts);
    cachePageData(`users/${user_id}`, "replies", replies);
  }, [posts, replies, contentView, showMore, selected, replySelected]);

  useEffect(() => {
    if (!posts.data.length) {
      fetchPosts({ restart: true, ignoreLoading: true });
    }
    if (contentView === "replies" && !replies.data.length) {
      fetchReplies({ restart: true, ignoreLoading: true });
    }
    setMounted(true);
  }, []);

  // CRITICAL: when navigating between `/users/[user_id]` routes, Next.js reuses the same page component.
  // Reset state + refetch so we never show the previous user's profile feed.
  useEffect(() => {
    const cachePath = `users/${user_id}`;

    // If this navigation came from back/forward, restore cached UI state instead of wiping it.
    const cachedPosts = pageCache(cachePath, "posts");
    const cachedReplies = pageCache(cachePath, "replies");
    const cachedSelected = pageCache(cachePath, "selected");
    const cachedReplySelected = pageCache(cachePath, "replySelected");
    const cachedShowMore = pageCache(cachePath, "showMore");
    const cachedContentView = pageCache(cachePath, "contentView");

    const nextContentView = viewParamProvided
      ? initialView
      : cachedContentView ?? "posts";

    setContentView(nextContentView);
    setSelected(cachedSelected ?? "recent");
    setReplySelected(cachedReplySelected ?? "newest");
    setShowMore(cachedShowMore ?? false);

    if (cachedPosts) {
      setPosts(cachedPosts);
    } else {
      setPosts({ ...initialPostsState });
    }

    if (cachedReplies) {
      setReplies(cachedReplies);
    } else {
      setReplies({ ...initialRepliesState });
    }
  }, [user_id]);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    if (contentView === "posts") {
      fetchPosts({ restart: true, ignoreLoading: true });
    } else {
      fetchReplies({ restart: true, ignoreLoading: true });
    }
  }, [user_id, contentView]);

  useEffect(() => {
    if (mounted) {
      if (contentView === "posts") {
        fetchPosts({ restart: true });
      }
    }
  }, [selected]);

  useEffect(() => {
    if (mounted) {
      if (contentView === "replies") {
        fetchReplies({ restart: true });
      }
    }
  }, [replySelected]);

  const setView = (view: "posts" | "replies") => {
    setContentView(view);
    router.replace(
      { pathname: router.pathname, query: { ...router.query, view } },
      undefined,
      { shallow: true }
    );

    if (view === "posts") {
      if (!posts.data.length) {
        fetchPosts({ restart: true, ignoreLoading: true });
      }
    } else {
      if (!replies.data.length) {
        fetchReplies({ restart: true, ignoreLoading: true });
      }
    }
  };

  return (
    <>
      <SEO
        title={user.MiiName + "'s Profile"}
        description={`Check out ${user.MiiName}'s profile on Archiverse, the largest Miiverse archive on the internet.`}
        isImageBig={false}
        imageUrl={user.MiiUrl}
      />
      <Wrapper>
        {user.BannerUrl && (
          <div className="flex bg-[#f6f6f6] text-neutral-700 font-semibold border-b-[1px] border-gray mt-[-16px] mx-[-16px] text-base">
            <img
              src={user?.BannerUrl}
              className="w-full md:h-[195px] sm:h-[200px] h-[140px] object-cover object-center"
            />
          </div>
        )}
        <div className={`relative ${user.BannerUrl && "mt-[-12px]"} flex`}>
          <div className="bg-white inline-block border-[1px] border-gray rounded-md">
            <img
              src={user.MiiUrl}
              className="w-16 h-16 object-cover rounded-md"
              alt={user.MiiName + " Icon"}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = IMAGES.unknownMii;
              }}
            />
          </div>
          <div className={` ${user.BannerUrl ? "mt-[16px]" : "mt-[4px]"} ml-4`}>
            <h1 className="font-bold text-base">{user.MiiName}</h1>
            <h2 className="font-normal text-sm mt-[-3px] text-[#969696]">
              {user.NNID}
            </h2>
          </div>
        </div>
        <div className="mt-4">
          <p
            className={`whitespace-pre-line text-sm ${
              !showMore && "line-clamp-2"
            }`}
          >
            {user.Bio}
          </p>
          {showMore && (
            <div className="my-4">
              <div className="flex items-center">
                <div className="inline-block bg-[#5ac800] text-center rounded-full w-[80px] py-[3px]">
                  <h1 className="text-white text-xs">Country</h1>
                </div>
                <h1 className="ml-4 text-neutral-700 text-sm">
                  {user.Country}
                </h1>
              </div>
              <div className="flex mt-2 items-center">
                <div className="inline-block bg-[#5ac800] text-center rounded-full w-[80px] py-[3px]">
                  <h1 className="text-white text-xs">Birthday</h1>
                </div>
                <h1 className="ml-4 text-neutral-700 text-sm">
                  {user.Birthday}
                </h1>
              </div>
            </div>
          )}
          <div className="flex justify-between mt-4">
            <div className="space-x-2 justify-center items-center">
              {user.WebArchiveUrl && (
                <Link
                  href={user.WebArchiveUrl}
                  className="hover:underline text-[10px] text-[#969696] "
                >
                  Web Archive
                </Link>
              )}
            </div>
            <div className="flex items-center">
              <button onClick={() => setShowMore((prevState) => !prevState)}>
                <h1 className="text-green text-sm hover:underline">
                  {showMore ? "Show less" : "Show more"}
                </h1>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2 pt-3 pb-2 bg-[#f6f6f6] flex text-sm px-2 mx-[-16px] border-gray border-y-[1px]">
          <div className="flex-1 flex justify-center border-r-[1px] border-gray">
            <div className="text-center">
              <h1 className="sm:text-[18px] text-[15px] font-normal text-neutral-800">
                {user.NumPosts ?? "-"}
              </h1>
              <h1 className="text-[10px] text-[#969696]">Posts</h1>
            </div>
          </div>
          <div className="flex-1 flex justify-center border-r-[1px] border-gray">
            <div className="text-center">
              <h1 className="sm:text-[18px] text-[15px] font-normal text-neutral-800">
                {displayDashIfZero(user.NumFriends) + " / 100"}
              </h1>
              <h1 className="text-[10px] text-[#969696]">Friends</h1>
            </div>
          </div>
          <div className="flex-1 flex justify-center border-r-[1px] border-gray">
            <div className="text-center">
              <h1 className="sm:text-[18px] text-[15px] font-normal text-neutral-800">
                {displayDashIfZero(user.NumFollowing)}
              </h1>
              <h1 className="text-[10px] text-[#969696]">Following</h1>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="text-center">
              <h1 className="sm:text-[18px] text-[15px] font-normal text-neutral-800">
                {displayDashIfZero(user.NumFollowers)}
              </h1>
              <h1 className="text-[10px] text-[#969696]">Followers</h1>
            </div>
          </div>
        </div>

        <div className="mx-[-16px]">
          <AdBanner/>
        </div>

        <div className="flex mt-6 mb-3">
          <button
            className={`rounded-l-md border-[1px] border-r-[.5px] ${getButtonStyles(
              contentView === "posts"
            )}`}
            onClick={() => setView("posts")}
          >
            Posts
          </button>
          <button
            className={`rounded-r-md border-[1px] border-l-[.5px] ${getButtonStyles(
              contentView === "replies"
            )}`}
            onClick={() => setView("replies")}
          >
            Replies
          </button>
        </div>

        {contentView === "posts" && (
          <>
            <div className="flex mb-4">
              <button
                className={`rounded-l-md border-[1px] border-r-[.5px] ${getButtonStyles(
                  selected === "recent"
                )}`}
                onClick={() => setSelected("recent")}
              >
                Recent
              </button>
              <button
                className={`border-[1px] ${getButtonStyles(selected === "oldest")}`}
                onClick={() => setSelected("oldest")}
              >
                Oldest
              </button>
              <button
                className={`rounded-r-md border-[1px] border-l-[.5px] ${getButtonStyles(
                  selected === "popular"
                )}`}
                onClick={() => setSelected("popular")}
              >
                Popular
              </button>
            </div>

            {posts.data?.map((post, index) => {
              return (
                <Link
                  key={post.ID + index + "PostCard NNID " + post.NNID}
                  href={`/posts/${post.ID}`}
                >
                  <PostCard
                    key={post.ID + index + "PostcardCommunity"}
                    post={post}
                    className={`${
                      index !== posts.data.length - 1 &&
                      "border-b-[1px] border-gray"
                    }`}
                    variant="list"
                  />
                </Link>
              );
            })}

            {posts.canLoadMore && !posts.fetching && !posts.error && (
              <div className="flex justify-center items-center">
                <button
                  onClick={() => fetchPosts({})}
                  className="md:ml-2 hover:brightness-95 inline-flex justify-center items-center bg-gradient-to-b from-white border-[1px] rounded-md border-gray text-neutral-600 to-neutral-200 font-medium py-2 px-8 mt-4 md:mt-0 md:text-base text-small"
                >
                  <h1 className="">Show More</h1>
                </button>
              </div>
            )}

            {!posts.fetching && posts.data?.length === 0 && !posts.error && (
              <h3 className="text-neutral-400 mt-[20px] font-normal text-base text-center">
                No posts found.
              </h3>
            )}
            <div className="flex justify-center items-center mt-4">
              <LoadOrRetry
                fetching={posts.fetching}
                error={posts.error}
                refetch={() => fetchPosts({ restart: posts.currPage === 1 })}
              />
            </div>
          </>
        )}

        {contentView === "replies" && (
          <>
            <div className="flex mb-4">
              <button
                className={`rounded-l-md border-[1px] border-r-[.5px] ${getButtonStyles(
                  replySelected === "newest"
                )}`}
                onClick={() => setReplySelected("newest")}
              >
                Newest
              </button>
              <button
                className={`border-[1px] ${getButtonStyles(
                  replySelected === "oldest"
                )}`}
                onClick={() => setReplySelected("oldest")}
              >
                Oldest
              </button>
              <button
                className={`rounded-r-md border-[1px] border-l-[.5px] ${getButtonStyles(
                  replySelected === "popular"
                )}`}
                onClick={() => setReplySelected("popular")}
              >
                Popular
              </button>
            </div>

            {replies.data?.map((item, index) => {
              return (
                <div
                  key={item.reply.ID + index + "ReplyFeedItem"}
                  className="bg-white border-t-[1px] border-gray mb-3 mx-[-16px]"
                >
                  <div className="flex items-center justify-between bg-[#f6f6f6] px-4 py-2">
                    <h3 className="text-[10px] text-neutral-500 font-semibold">
                      Replying to
                    </h3>
                    {item.reply.ReplyingToID && (
                      <Link
                        href={`/posts/${item.reply.ReplyingToID}`}
                        className="text-[10px] text-green hover:underline font-semibold"
                      >
                        View Post
                      </Link>
                    )}
                  </div>

                  {item.post && !item.post.DoNotShow ? (
                    <Link href={`/posts/${item.post.ID}`} className="block px-4">
                      <PostCard
                        post={item.post}
                        variant="list"
                        className="px-0 md:px-0"
                      />
                    </Link>
                  ) : (
                    <div className="px-2 py-3 text-xs text-neutral-500">
                      Original post not found.
                    </div>
                  )}

                  <div className="border-t-[1px] border-gray mx-4" />
                  <Link
                    href={`/posts/${item.reply.ReplyingToID}?reply=${item.reply.ID}`}
                    className="block"
                  >
                    <ReplyCard reply={item.reply} className="px-4" />
                  </Link>
                </div>
              );
            })}

            {replies.canLoadMore && !replies.fetching && !replies.error && (
              <div className="flex justify-center items-center">
                <button
                  onClick={() => fetchReplies({})}
                  className="md:ml-2 hover:brightness-95 inline-flex justify-center items-center bg-gradient-to-b from-white border-[1px] rounded-md border-gray text-neutral-600 to-neutral-200 font-medium py-2 px-8 mt-4 md:mt-0 md:text-base text-small"
                >
                  <h1 className="">Show More</h1>
                </button>
              </div>
            )}

            {!replies.fetching && replies.data?.length === 0 && !replies.error && (
              <h3 className="text-neutral-400 mt-[20px] font-normal text-base text-center">
                No replies found.
              </h3>
            )}
            <div className="flex justify-center items-center mt-4">
              <LoadOrRetry
                fetching={replies.fetching}
                error={replies.error}
                refetch={() => fetchReplies({ restart: replies.currPage === 1 })}
              />
            </div>
          </>
        )}
      </Wrapper>
    </>
  );
}

// Next.js server-side props function
export const getServerSideProps = async (context) => {
  await logServerStats(context.req, context.res)

  const { user_id, view } = context.query;

  var user: User = null;

  const userInfo = await getUserInfo({ NNID: user_id });

  if ((userInfo as any).redirect) {
    return {
      redirect: (userInfo as any).redirect,
    };
  }

  user = userInfo as User;

  const viewParamProvided = typeof view === "string";
  const initialView = view === "replies" ? "replies" : "posts";

  return {
    props: {
      user,
      user_id,
      viewParamProvided,
      initialView,
    },
  };
};
