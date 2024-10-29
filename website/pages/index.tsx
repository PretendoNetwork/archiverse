import Image from "next/image";
import SEO from "@/components/SEO";
import Link from "next/link";
import { Community, Post, getHomepageDrawings } from "@server/database";
import { numberWithCommas } from "@utils/utils";
import Loading from "@components/Loading";
import LoadOrRetry from "@components/LoadOrRetry";
import Wrapper from "@components/Wrapper";
import { useEffect, useRef, useState } from "react";
import { queryAPI } from "@utils/queryAPI";
import HomepageDrawings from "@components/HomepageDrawings";
import PostCard from "@components/PostCard";
import { LINKS } from "@constants/constants";
import MiiverseSymbol from "@components/MiiverseSymbol";
import { usePageCache } from "@hooks/usePageCache";
import AdBanner from "@components/AdBanner";
import { logServerStats } from "@server/logger";

export default function Home() {
  const { pageCache, cachePageData } = usePageCache();

  const [searchQuery, setSearchQuery] = useState(
    pageCache("/", "searchQuery") ?? ""
  );

  useEffect(() => {
    if (communityList.data.length === 0) {
      fetchNewCommunities(true);
    }
    if (popularDrawings.data.length === 0) {
      fetchPopularDrawings(true);
    }
    if (randomPosts.data.length === 0) {
      fetchRandomPosts(true);
    }
  }, []);

  const [popularDrawings, setPopularDrawings] = useState<{
    data: Post[];
    fetching: boolean;
    error: string;
  }>(
    pageCache("/", "popularDrawings") ?? {
      data: [],
      fetching: true,
      error: null,
    }
  );

  const [randomPosts, setRandomPosts] = useState<{
    data: Post[];
    currentIndex: number;
    fetching: boolean;
    error: string;
  }>(
    pageCache("/", "randomPosts") ?? {
      data: [],
      currentIndex: 0,
      fetching: true,
      error: null,
    }
  );

  const [communityList, setCommunityList] = useState<{
    data: Community[];
    fetching: boolean;
    error: string;
    canPullMore: boolean;
    currPage: number;
  }>(
    pageCache("/", "communityList") ?? {
      data: [],
      fetching: true,
      error: null,
      canPullMore: true,
      currPage: 1,
    }
  );

  const [searchedCommunities, setSearchedCommunities] = useState<{
    data: Community[];
    fetching: boolean;
    error: string;
  }>(
    pageCache("/", "searchedCommunities") ?? {
      data: [],
      fetching: false,
      error: null,
    }
  );

  const [displaySearchResults, setDisplaySearchResults] = useState<boolean>(
    pageCache("/", "displaySearchResults") ?? false
  );

  useEffect(() => {
    cachePageData("/", "randomPosts", randomPosts);
    cachePageData("/", "popularDrawings", popularDrawings);
    cachePageData("/", "communityList", communityList);
    cachePageData("/", "searchedCommunities", searchedCommunities);
    cachePageData("/", "displaySearchResults", displaySearchResults);
    cachePageData("/", "searchQuery", searchQuery);
  }, [
    randomPosts,
    communityList,
    searchedCommunities,
    displaySearchResults,
    searchQuery,
    popularDrawings,
  ]);

  const fetchRandomPosts = async (ignoreFetching?: boolean) => {
    if (randomPosts.fetching && !ignoreFetching) {
      return;
    }
    setRandomPosts((prevState) => ({
      ...prevState,
      fetching: true,
      data: [],
      currentIndex: 0,
    }));

    const { data, error } = await queryAPI<Post[]>(`posts?random=true`, false);

    if (error) {
      setRandomPosts((prevState) => ({
        ...prevState,
        fetching: false,
        error: error,
      }));
      return;
    }
    setRandomPosts((prevState) => ({
      ...prevState,
      fetching: false,
      error: null,
      data: data,
      currentIndex: 0,
    }));
  };

  const fetchPopularDrawings = async (ignoreFetching?: boolean) => {
    if (randomPosts.fetching && !ignoreFetching) {
      return;
    }
    setPopularDrawings((prevState) => ({
      ...prevState,
      fetching: true,
      data: [],
      currentIndex: 0,
    }));

    const { data, error } = await queryAPI<Post[]>(
      `posts?homepage=true`,
      false
    );

    if (error) {
      setPopularDrawings((prevState) => ({
        ...prevState,
        fetching: false,
        error: error,
      }));
      console.log("Error fetching popular drawings " + error);
      return;
    }
    setPopularDrawings((prevState) => ({
      ...prevState,
      fetching: false,
      error: null,
      data: data,
    }));
  };

  const fetchNewCommunities = async (ignoreFetching?: boolean) => {
    if (communityList.fetching && !ignoreFetching) {
      return;
    }
    setCommunityList((prevState) => ({
      ...prevState,
      fetching: true,
    }));
    const { data, error } = await queryAPI<Community[]>(
      `communities?page=${communityList.currPage}`
    );
    if (error) {
      console.log(error);
      setCommunityList((prevState) => ({
        ...prevState,
        fetching: false,
        error: error,
      }));
      return;
    }
    if (data?.length === 0) {
      setCommunityList((prevState) => ({
        ...prevState,
        canPullMore: false,
      }));
    }
    setCommunityList((prevState) => ({
      ...prevState,
      fetching: false,
      data: [...prevState.data, ...data],
      currPage: prevState?.currPage + 1,
    }));
  };

  const fetchSearchCommunities = async (ignoreFetching?: boolean) => {
    if (searchedCommunities.fetching && !ignoreFetching) {
      return;
    }
    setSearchedCommunities((prevState) => ({
      ...prevState,
      fetching: true,
    }));
    const encodedSearch = encodeURIComponent(searchQuery?.trim().toLowerCase());
    const { data, error } = await queryAPI<Community[]>(
      `communities?search=${encodedSearch}`
    );
    if (error) {
      console.log(error);
      setSearchedCommunities((prevState) => ({
        ...prevState,
        fetching: false,
        error: error,
      }));
      return;
    }
    setSearchedCommunities((prevState) => ({
      ...prevState,
      fetching: false,
      data: data,
    }));
  };

  const handleSearchChangeText = (event) => {
    const newSearchQuery = event.target.value;
    setSearchQuery(newSearchQuery);
    if (!newSearchQuery) {
      setDisplaySearchResults(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setDisplaySearchResults(true);
      fetchSearchCommunities();
    } else {
      setDisplaySearchResults(false);
    }
  };

  const handleGenerate = () => {
    if (randomPosts.currentIndex < randomPosts.data.length - 1) {
      setRandomPosts((prevState) => ({
        ...prevState,
        currentIndex: prevState.currentIndex + 1,
      }));
    } else {
      fetchRandomPosts();
    }
  };

  return (
    <>
      <SEO />
      <Wrapper>
        <h2 className="text-xl font-bold mb-4 text-center text-green mt-6">
          Welcome to Archiverse!
        </h2>
        <div className="flex justify-center mt-8">
          <Image
            src={"/welcome-image.png"}
            alt={"welcome image"}
            width={430}
            height={137}
          />
        </div>
        <p className="text-sm mt-6 text-neutral-700">
          Archiverse is an archive of Miiverse, a social media platform for the
          Nintendo Wii U and 3DS which ran from November 18, 2012 until November
          8, 2017. This archive stores millions of archived Miiverse users,
          posts, drawings, comments, and more, totaling over 17TB of data.
        </p>

        <div className="mx-[-16px] mt-2">
          <AdBanner/>
        </div>

        <div className="flex justify-between border-b-4 mx-[-16px] px-4 py-2 border-green items-end">
          <div className="flex items-end">
            <MiiverseSymbol
              symbol={"pencil_draw"}
              className="fill-green sm:h-6 sm:w-6 h-5 w-5 mr-2 sm:mb-[4px] mb-[2px]"
            />
            <h1 className="text-green font-bold sm:text-lg text-sm">
              Popular Drawings
            </h1>
          </div>
        </div>

        {!popularDrawings.data.length ||
        popularDrawings.fetching ||
        popularDrawings.error ? (
          <div className="flex justify-center items-center mt-3 mb-4 h-[218px]">
            <LoadOrRetry
              fetching={popularDrawings.fetching}
              error={popularDrawings.error}
              refetch={fetchPopularDrawings}
            />
          </div>
        ) : (
          <div className="w-full">
            <HomepageDrawings posts={popularDrawings.data} />
          </div>
        )}

        <div>
          <div className="mt-4 flex justify-between border-b-4 mx-[-16px] px-4 py-2 border-green mb-3 items-end">
            <div className="flex items-end">
              <MiiverseSymbol
                symbol={"star_fill"}
                className="fill-green sm:h-5 sm:w-5 h-4 w-4 mr-2 sm:mb-[6px] mb-1"
              />
              <h1 className="text-green font-bold sm:text-lg text-sm">
                Random Post
              </h1>
            </div>
            <button
              onClick={handleGenerate}
              className="md:ml-2 hover:brightness-95 inline-flex justify-center items-center bg-gradient-to-b from-white border-[1px] rounded-md border-gray text-neutral-600 to-neutral-200 font-medium py-[2px] px-4 mt-4 md:mt-0 md:text-base text-sm"
            >
              <h1 className="">Generate</h1>
            </button>
          </div>

          {!randomPosts.data.length || randomPosts.fetching ? (
            <div className="flex justify-center items-center h-[280px]">
              <LoadOrRetry
                fetching={randomPosts.fetching}
                error={randomPosts.error}
                refetch={fetchRandomPosts}
              />
            </div>
          ) : (
            <div className="w-full">
              <Link
                href={`/posts/${randomPosts.data[randomPosts.currentIndex].ID}`}
              >
                <PostCard
                  key={randomPosts.data[randomPosts.currentIndex].ID}
                  post={randomPosts.data[randomPosts.currentIndex]}
                  variant={"list"}
                />
              </Link>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-between border-b-4 mx-[-16px] px-4 py-2 border-green items-end">
          <div className="flex items-end">
            <MiiverseSymbol
              symbol={"silhouette_people"}
              className="fill-green sm:h-6 sm:w-6 h-5 w-5 mr-2 sm:mb-[4px] mb-[2px]"
            />
            <h1 className="text-green font-bold sm:text-lg text-sm">
              Communities
            </h1>
          </div>

          <form onSubmit={handleSearch} className="flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChangeText}
              placeholder="Search Communities"
              className="rounded-md pl-2 sm:pr-10 pr-4 bg-neutral-200 sm:text-sm py-1 placeholder-neutral-500 text-xs"
            />
            <button
              type="submit"
              className="absolute right-2 bg-neutral-200 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer"
            >
              <MiiverseSymbol
                className="fill-neutral-500 hover:fill-neutral-700 sm:h-4 sm:w-4 h-3 w-3"
                symbol={"magnifying_glass"}
              />
            </button>
          </form>
        </div>

        {(displaySearchResults
          ? searchedCommunities.data
          : communityList.data
        )?.map((community, index) => {
          return (
            <Link
              key={
                "community " +
                community.GameID +
                community.TitleID +
                "index " +
                index
              }
              className={`flex py-2 ${
                index ===
                (displaySearchResults
                  ? searchedCommunities.data
                  : communityList.data
                ).length -
                  1
                  ? "mb-2"
                  : "border-b-[1px]"
              } border-gray hover:brightness-95 bg-white cursor-pointer`}
              href={"/titles/" + community.TitleID + "/" + community.GameID}
            >
              <img
                src={community.CommunityIconUrl ?? community.CommunityBanner}
                alt={community.GameTitle + " Icon"}
                className="w-[54px] h-[54px] rounded-md border-gray border-[1px] mr-4"
              />
              <div>
                <h2 className="font-bold sm:text-base text-sm mt-1">
                  {community.CommunityTitle}
                </h2>
                <div className="flex mt-1">
                  <h3 className="flex items-center justify-center font-normal text-xs sm:text-sm text-neutral-500 mr-4">
                    <MiiverseSymbol
                      className="mr-[6px] h-4 w-4 fill-neutral-500 "
                      symbol={"silhouette_people"}
                    />
                    {numberWithCommas(community.NumPosts)}
                  </h3>
                  <h3 className="flex items-center justify-center font-normal text-xs sm:text-sm text-neutral-500">
                    <MiiverseSymbol
                      className="mr-[6px] h-4 w-4 fill-neutral-500 "
                      symbol={"globe"}
                    />
                    {community.Region}
                  </h3>
                </div>
              </div>
            </Link>
          );
        })}

        {communityList.canPullMore &&
          !communityList.fetching &&
          !displaySearchResults &&
          !communityList.error && (
            <div className="flex justify-center items-center">
              <button
                onClick={() => fetchNewCommunities()}
                className="md:ml-2 hover:brightness-95 inline-flex justify-center items-center bg-gradient-to-b from-white border-[1px] rounded-md border-gray text-neutral-600 to-neutral-200 font-medium py-2 px-8 mt-4 md:mt-0 md:text-base text-small"
              >
                <h1 className="">Show More</h1>
              </button>
            </div>
          )}
        <div className="flex justify-center items-center">
          <LoadOrRetry
            fetching={
              displaySearchResults
                ? searchedCommunities.fetching
                : communityList.fetching
            }
            error={
              displaySearchResults
                ? searchedCommunities.error
                : communityList.error
            }
            refetch={fetchNewCommunities}
            className="mt-4"
          />

          {(displaySearchResults
            ? searchedCommunities.data?.length === 0 &&
              !searchedCommunities.error &&
              !searchedCommunities.fetching
            : communityList.data?.length === 0 &&
              !communityList.error &&
              !communityList.fetching) && (
            <h3 className="text-neutral-400 mt-[15px] mb-[6px] font-normal text-base">
              No communities found.
            </h3>
          )}
        </div>
      </Wrapper>
    </>
  );
}

// Next.js server-side props function
export const getServerSideProps = async (context) => {
  await logServerStats(context.req, context.res);

  return {
    props: {},
  };
};
