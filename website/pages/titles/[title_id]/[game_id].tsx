import SEO from "@/components/SEO";
import { Community, Post, getCommunity } from "@server/database";
import Wrapper from "@components/Wrapper";
import LoadOrRetry from "@components/LoadOrRetry";
import { useEffect, useState } from "react";
import { queryAPI } from "@utils/queryAPI";
import { numberWithCommas } from "@utils/utils";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import PostCard from "@components/PostCard";
import Loading from "@components/Loading";
import MiiverseSymbol from "@components/MiiverseSymbol";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { usePageCache } from "@hooks/usePageCache";
import AdBanner from "@components/AdBanner";
import { logServerStats } from "@server/logger";

export default function Home({ title_id, game_id, community }) {
  const { pageCache, cachePageData } = usePageCache();

  const [beforeDate, setBeforeDate] = useState<{
    date: Date;
    useDate: boolean;
  }>(
    pageCache(`titles/${title_id}/${game_id}`, "beforeDate") ?? {
      date: new Date(Date.UTC(2017, 10, 9)),
      useDate: false,
    }
  );

  const [popularSelected, setPopularSelected] = useState(
    pageCache(`titles/${title_id}/${game_id}`, "popularSelected") ?? true
  );

  const [hasRelatedCommunities, setHasRelatedCommunities] = useState<boolean>(
    pageCache(`titles/${title_id}/${game_id}`, "hasRelatedCommunities") ?? false
  );

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

  const [isBannerLoading, setIsBannerLoading] = useState(true);

  const [recentPosts, setRecentPosts] = useState<{
    data: Post[];
    fetching: boolean;
    error: string;
    currPage: number;
    canLoadMore: boolean;
  }>(
    pageCache(`titles/${title_id}/${game_id}`, "recentPosts") ?? {
      data: [],
      fetching: false,
      error: null,
      currPage: 1,
      canLoadMore: true,
    }
  );

  const [popularPosts, setPopularPosts] = useState<{
    data: Post[];
    fetching: boolean;
    error: string;
    currPage: number;
    canLoadMore: boolean;
  }>(
    pageCache(`titles/${title_id}/${game_id}`, "popularPosts") ?? {
      data: [],
      fetching: false,
      error: null,
      currPage: 1,
      canLoadMore: true,
    }
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) {
      fetchPosts(true);
    }
  }, [beforeDate.useDate, popularSelected]);

  const [posts, setPosts] = popularSelected
    ? [popularPosts, setPopularPosts]
    : [recentPosts, setRecentPosts];

  const getRelatedCommunities = async () => {
    const { data, error } = await queryAPI<Community[]>(
      `communities?title_id=${title_id}`
    );

    if (data && data.length > 1) {
      setHasRelatedCommunities(true);
    }
  };

  const fetchPosts = async (restart?: boolean) => {
    if (posts.fetching) {
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
    var queryUrl = `posts?title_id=${title_id}&game_id=${game_id}`;
    if (beforeDate.useDate) {
      queryUrl += `&before_datetime=${beforeDate.date.toISOString()}`;
    }
    queryUrl += `&sort_mode=${
      popularSelected ? "popular" : "recent"
    }&page=${page}`;

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
        canLoadMore: data.length !== 0,
      });
    } else {
      setPosts((prevState) => ({
        ...prevState,
        fetching: false,
        error: null,
        currPage: page,
        data: prevState.data.concat(data),
        canLoadMore: data.length !== 0,
      }));
    }
  };

  useEffect(() => {
    if (!recentPosts.data.length && !popularPosts.data.length) {
      getRelatedCommunities();
      fetchPosts(true);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (community?.CommunityBanner) {
      const img = new Image();
      img.src = community.CommunityBanner;
      img.onload = () => {
        setIsBannerLoading(false);
      };
      img.onerror = () => setIsBannerLoading(false);
    } else {
      setIsBannerLoading(false);
    }
  }, [community]);

  useEffect(() => {
    cachePageData(`titles/${title_id}/${game_id}`, "beforeDate", beforeDate);
    cachePageData(
      `titles/${title_id}/${game_id}`,
      "popularSelected",
      popularSelected
    );
    cachePageData(`titles/${title_id}/${game_id}`, "recentPosts", recentPosts);
    cachePageData(
      `titles/${title_id}/${game_id}`,
      "popularPosts",
      popularPosts
    );
    cachePageData(
      `titles/${title_id}/${game_id}`,
      "hasRelatedCommunities",
      hasRelatedCommunities
    );
  }, [
    beforeDate,
    popularSelected,
    recentPosts,
    popularPosts,
    hasRelatedCommunities,
  ]);

  return (
    <>
      <SEO
        title={community?.CommunityTitle}
        description={`Check out the ${community?.CommunityTitle} on Archiverse, the largest Miiverse archive on the internet.`}
        imageUrl={community?.CommunityBanner ?? community?.CommunityIconUrl}
        isImageBig={!!community?.CommunityBanner}
      />
      <Wrapper>
        {community && (
          <div>
            <div className="flex bg-[#f6f6f6] text-[#969696] font-semibold mt-[-16px] mx-[-16px] px-2 py-1 md:text-sm text-xs">
              {community?.GameTitle}
            </div>
            <div className="mx-[-16px]">
              {isBannerLoading ? (
                <div className="flex justify-center items-center sm:h-[218px] h-[135px]">
                  <Loading />
                </div>
              ) : (
                <img src={community?.CommunityBanner} className="w-full" />
              )}
            </div>
            <div className={`flex my-2`}>
              <img
                src={community?.CommunityIconUrl ?? community?.CommunityBanner}
                alt={community?.GameTitle + " Icon"}
                className="w-[54px] h-[54px] rounded-md border-gray border-[1px] mr-4"
              />
              <div>
                <h2 className="font-bold sm:text-base text-sm mt-[0px]">
                  {community?.CommunityTitle}
                </h2>
                <div className="flex mt-[1px]">
                  <h3 className="flex items-center justify-center font-normal text-xs text-neutral-500 mr-4">
                    <MiiverseSymbol
                      className="mr-[6px] h-[14px] w-[14px] fill-neutral-500 "
                      symbol={"silhouette_people"}
                    />
                    {numberWithCommas(community.NumPosts)}
                  </h3>
                  <h3 className="flex items-center justify-center font-normal text-xs text-neutral-500">
                    <MiiverseSymbol
                      className="mr-[5px] h-3 w-3 fill-neutral-500 "
                      symbol={"globe"}
                    />
                    {community.Region}
                  </h3>
                </div>
                {community.WebArchiveUrl && (
                  <div className=" mt-[-4px]">
                    <Link
                      href={community.WebArchiveUrl}
                      className="hover:underline text-[10px] text-[#969696]"
                    >
                      Web Archive
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {!hasRelatedCommunities ? (
          <div className="border-gray border-b-[1px] mx-[-16px]" />
        ) : (
          <Link
            href={`/titles/${title_id}`}
            className="border-gray border-y-[1px] mx-[-16px] px-[16px] bg-[#f6f6f6] flex justify-between py-2 font-medium items-center mb-3"
          >
            <h1 className="text-neutral-600 text-sm">Related Communities</h1>
            <IoIosArrowForward className="h-6 w-6 text-neutral-400" />
          </Link>
        )}

        <div className="mx-[-16px]">
          <AdBanner />
        </div>

        <div className="flex mt-4">
          <button
            className={`rounded-l-md border-[1px] border-r-[.5px] ${getButtonStyles(
              !popularSelected
            )}`}
            onClick={() => setPopularSelected(false)}
          >
            Recent Posts
          </button>
          <button
            className={`rounded-r-md border-[1px] border-l-[.5px] ${getButtonStyles(
              popularSelected
            )}`}
            onClick={() => setPopularSelected(true)}
          >
            Popular Posts
          </button>
        </div>

        <div className={`flex justify-center items-center mt-4 flex-col`}>
          <div
            className={`flex ${
              beforeDate.useDate ? "" : "cursor-not-allowed opacity-50"
            }`}
          >
            <DatePicker
              maxDate={new Date(Date.UTC(2017, 10, 9))}
              minDate={new Date(Date.UTC(2012, 10, 9))}
              dateFormat="MM/dd/yyyy h:mm aa"
              timeFormat="HH:mm"
              showTimeInput
              selectsMultiple={false as true}
              selected={beforeDate.date}
              disabled={!beforeDate.useDate}
              className={`border-gray font-normal bg-[#f6f6f6] border-[1px] text-center rounded-l-md text-neutral-700`}
              onChange={(newDate) =>
                setBeforeDate((prevState) => ({
                  ...prevState,
                  date: newDate as unknown as Date,
                }))
              }
            />
            <button
              onClick={() => fetchPosts(true)}
              className={`px-2 border-gray font-normal bg-[#f6f6f6] ${
                beforeDate.useDate && "hover:bg-[#e2e2e2]"
              } border-r-[1px] border-y-[1px] rounded-r-md`}
              disabled={!beforeDate.useDate}
            >
              <MiiverseSymbol
                className="fill-neutral-500 sm:h-4 sm:w-4 h-3 w-3"
                symbol={"magnifying_glass"}
              />
            </button>
          </div>
          <label
            className={`text-xs ${
              beforeDate.useDate ? "text-neutral-700" : "text-neutral-500"
            } items-center justify-center flex cursor-pointer mt-2 mb-2`}
          >
            <input
              type="checkbox"
              className="mr-1 h-3 w-3 accent-green cursor-pointer"
              checked={beforeDate.useDate}
              onChange={(e) => {
                setBeforeDate((prevState) => ({
                  ...prevState,
                  useDate: e.target.checked,
                }));
              }}
            />
            Search by Date
          </label>
        </div>
        {posts.data?.map((post, index) => {
          return (
            <Link key={post.ID + index} href={`/posts/${post.ID}`}>
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
              onClick={() => fetchPosts()}
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
            refetch={() => fetchPosts(posts.currPage === 1)}
          />
        </div>
      </Wrapper>
    </>
  );
}

export const getServerSideProps = async (context) => {
  await logServerStats(context.req, context.res);

  const { title_id, game_id } = context.query;

  var community: Community = await getCommunity({
    gameID: game_id,
    titleID: title_id,
  });

  return {
    props: {
      title_id,
      game_id,
      community,
    },
  };
};
