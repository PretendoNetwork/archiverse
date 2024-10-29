import Image from "next/image";
import SEO from "@/components/SEO";
import styles from "./index.module.css";
import Link from "next/link";
import { Community, Post, User, getUserInfo } from "@server/database";
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

export default function Home({
  user,
  user_id,
}: {
  user: User;
  user_id: string;
}) {
  const { pageCache, cachePageData } = usePageCache();

  const [mounted, setMounted] = useState(false);

  const [selected, setSelected] = useState<"recent" | "popular" | "oldest">(
    pageCache(`users/${user_id}`, "selected") ?? "recent"
  );

  const [showMore, setShowMore] = useState(
    pageCache(`users/${user_id}`, "showMore") ?? false
  );

  const [posts, setPosts] = useState<{
    data: Post[];
    fetching: boolean;
    error: string;
    currPage: number;
    canLoadMore: boolean;
  }>(
    pageCache(`users/${user_id}`, "posts") ?? {
      data: [],
      fetching: true,
      error: null,
      currPage: 1,
      canLoadMore: true,
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
    cachePageData(`users/${user_id}`, "selected", selected);
    cachePageData(`users/${user_id}`, "showMore", showMore);
    cachePageData(`users/${user_id}`, "posts", posts);
  }, [posts, showMore, selected]);

  useEffect(() => {
    if (!posts.data.length) {
      fetchPosts({ restart: true, ignoreLoading: true });
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPosts({ restart: true });
    }
  }, [selected]);

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

        <div className="flex mt-6 mb-4">
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
      </Wrapper>
    </>
  );
}

// Next.js server-side props function
export const getServerSideProps = async (context) => {
  await logServerStats(context.req, context.res)

  const { user_id } = context.query;

  var user: User = null;

  const userInfo = await getUserInfo({ NNID: user_id });

  if ((userInfo as any).redirect) {
    return {
      redirect: (userInfo as any).redirect,
    };
  }

  user = userInfo as User;

  return {
    props: {
      user,
      user_id,
    },
  };
};
