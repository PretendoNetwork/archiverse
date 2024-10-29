import Image from "next/image";
import SEO from "@/components/SEO";
import styles from "./index.module.css";
import Link from "next/link";
import {
  Community,
  Post,
  User,
  getCommunity,
  getRandomPosts,
  getUserInfo,
} from "@server/database";
import { numberWithCommas } from "@utils/utils";
import Loading from "@components/Loading";
import LoadOrRetry from "@components/LoadOrRetry";
import Wrapper from "@components/Wrapper";
import { useEffect, useRef, useState } from "react";
import { queryAPI } from "@utils/queryAPI";
import { IMAGES } from "@constants/constants";
import MiiverseSymbol from "@components/MiiverseSymbol";
import PostCard from "@components/PostCard";
import { usePageCache } from "@hooks/usePageCache";
import { IoIosWarning } from "react-icons/io";
import { logServerStats } from "@server/logger";

export default function Home() {
  const { pageCache, cachePageData } = usePageCache();

  const [currSearch, setCurrSearch] = useState<string>(
    pageCache("/search", "searchedQuery") ?? ""
  );

  // We have currSearch and searchedQuery because we need to store currSearch to store progress. We then use searchedQuery to search in the other tabs when the user clicks on them

  const [searchedQuery, setSearchedQuery] = useState<string>(currSearch);

  const [highlightedText, setHighlightedText] = useState(searchedQuery);

  const [selected, setSelected] = useState<"posts" | "users" | "communities">(
    pageCache("/search", "selected") ?? "users"
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

  const [users, setUsers] = useState<{
    data: User[];
    fetching: boolean;
    error: string;
  }>(
    pageCache("/search", "users") ?? {
      data: null,
      fetching: false,
      error: null,
    }
  );

  const [posts, setPosts] = useState<{
    data: Post[];
    fetching: boolean;
    error: string;
  }>(
    pageCache("/search", "posts") ?? {
      data: null,
      fetching: false,
      error: null,
    }
  );

  const [communities, setCommunities] = useState<{
    data: Community[];
    fetching: boolean;
    error: string;
  }>(
    pageCache("/search", "communities") ?? {
      data: null,
      fetching: false,
      error: null,
    }
  );

  const handleSearchChangeText = (event) => {
    setCurrSearch(event.target.value);
  };

  const fetchCommunities = async (query: string) => {
    if (communities.fetching) {
      return;
    }
    setCommunities((prevState) => ({
      ...prevState,
      fetching: true,
    }));

    const encodedSearch = encodeURIComponent(query?.trim().toLowerCase());

    const { data, error } = await queryAPI<Community[]>(
      `communities?search=${encodedSearch}`
    );

    setCommunities((prevState) => ({
      ...prevState,
      fetching: false,
      data: data ?? [],
      error: error,
    }));
  };

  const fetchUsers = async (query: string) => {
    if (users.fetching) {
      return;
    }

    setUsers((prevState) => ({
      ...prevState,
      data: null,
      fetching: true,
      error: null,
    }));

    const encodedSearch = encodeURIComponent(query?.trim().toLowerCase());

    const { data, error } = await queryAPI<User[]>(
      `users?search=${encodedSearch}`
    );

    setUsers((prevState) => ({
      ...prevState,
      fetching: false,
      data: data ?? [],
      error: error,
    }));
  };

  useEffect(() => {
    cachePageData("/search", "searchedQuery", searchedQuery);
    cachePageData("/search", "selected", selected);
    cachePageData("/search", "users", users);
    cachePageData("/search", "posts", posts);
    cachePageData("/search", "communities", communities);
  }, [searchedQuery, selected, users, posts, communities]);

  const fetchPosts = async (query: string) => {
    if (posts.fetching) {
      return;
    }

    setPosts((prevState) => ({
      ...prevState,
      data: null,
      fetching: true,
      error: null,
    }));
    const encodedSearch = encodeURIComponent(query?.toLowerCase());
    const { data, error } = await queryAPI<Post[]>(
      `posts?search=${encodedSearch}`
    );

    setPosts((prevState) => ({
      ...prevState,
      fetching: false,
      data: data ?? [],
      error: error,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e?.preventDefault();
    setSearchedQuery(currSearch);
    if (currSearch?.trim()) {
      setPosts((prevState) => ({
        ...prevState,
        data: null,
      }));
      setUsers((prevState) => ({
        ...prevState,
        data: null,
      }));
      setCommunities((prevState) => ({
        ...prevState,
        data: null,
      }));

      setHighlightedText(currSearch);

      switch (selected) {
        case "users":
          return fetchUsers(currSearch);
        case "communities":
          return fetchCommunities(currSearch);
        case "posts":
          return fetchPosts(currSearch);
      }
    }
  };

  const getSearchPlaceholder = () => {
    switch (selected) {
      case "users":
        return "Search Users by NNID";

      case "communities":
        return "Search Communities";

      case "posts":
        return "Search Posts";

      default:
        return "Search Archiverse";
    }
  };

  return (
    <>
      <SEO title={"Search Users"} makeDescriptionBlank={true} />
      <Wrapper>
        <div className="flex bg-[#f6f6f6] text-neutral-700 font-semibold border-b-[1px] border-gray mt-[-16px] mx-[-16px] px-2 py-1 text-base">
          Search
        </div>
        <div>
          <form
            onSubmit={handleSearch}
            className="flex items-center relative w-full mt-4"
          >
            <input
              type="text"
              value={currSearch}
              onChange={handleSearchChangeText}
              placeholder={getSearchPlaceholder()}
              className="rounded-md pl-2 sm:pr-10 pr-4 bg-neutral-200 md:text-sm py-1 placeholder-neutral-500 text-xs w-full"
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
          <div className="flex mt-6 mb-4">
            <button
              className={`rounded-l-md border-[1px] border-r-[.5px] ${getButtonStyles(
                selected === "users"
              )}`}
              onClick={() => {
                setSelected("users");
                if (searchedQuery.trim()) {
                  fetchUsers(searchedQuery);
                }
              }}
            >
              Users
            </button>
            <button
              className={`border-[1px] rounded-r-md border-l-[.5px] ${getButtonStyles(
                selected === "communities"
              )}`}
              onClick={() => {
                setSelected("communities");
                if (searchedQuery.trim()) {
                  fetchCommunities(searchedQuery);
                }
              }}
            >
              Communities
            </button>
            {/* <button
              className={`rounded-r-md border-[1px] border-l-[.5px] ${getButtonStyles(
                selected === "posts"
              )}`}
              onClick={() => {
                setSelected("posts");
                if (searchedQuery.trim()) {
                  fetchPosts(searchedQuery);
                }
              }}
            >
              Posts
            </button> */}
          </div>
        </div>

        {selected === "users" &&
          users.data?.map((user, index) => {
            return (
              <Link
                key={"community " + user.NNID + " Index " + index}
                className={`flex p-2 ${
                  index === users.data.length - 1 ? "mb-2" : "border-b-[1px]"
                } border-gray hover:brightness-95 bg-white cursor-pointer items-start`}
                href={`/users/${user.NNID}`}
              >
                <div className="w-[54px] h-[54px] flex-shrink-0 rounded-md border-gray border-[1px] mr-4">
                  <img
                    src={user.MiiUrl}
                    alt={user.MiiName + " Icon"}
                    className="w-full h-full object-cover rounded-md"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src = IMAGES.unknownMii;
                    }}
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <h2 className="font-bold text-base">
                    {user.MiiName}
                    <span className="ml-2 font-normal text-xs text-[#797979]">
                      {user.NNID}
                    </span>
                  </h2>
                  <div className="flex-grow flex flex-col justify-center">
                    <span className="font-normal text-xs text-neutral-800 line-clamp-2 break-words">
                      {user.Bio}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

        {selected === "users" &&
          !users.fetching &&
          users.data?.length === 0 &&
          !users.error && (
            <h3 className="text-neutral-400 mt-4 font-normal text-base text-center">
              No users found.
            </h3>
          )}

        {selected === "users" && (
          <div className="flex justify-center items-center">
            <LoadOrRetry
              fetching={users.fetching}
              error={users.error}
              refetch={() => fetchUsers(searchedQuery)}
              className="mt-4"
            />
          </div>
        )}

        {selected === "posts" && (
          <div className="flex justify-center text-center items-center mt-[-8px] mb-2">
            <IoIosWarning className="text-orange-400 mb-[.5px] mr-1" />
            <h1 className="text-neutral-500 text-xs">
              Searching posts may fail due to large data
            </h1>
          </div>
        )}

        {selected === "posts" &&
          posts.data?.map((post, index) => {
            return (
              <Link
                key={"post " + post.NNID + " Index " + index}
                className={`flex pb-2 ${index === 0 ? "mt-[-4px]" : ""} ${
                  index === posts.data.length - 1 ? "mb-2" : "border-b-[1px]"
                } border-gray hover:brightness-95 bg-white cursor-pointer`}
                href={`/posts/${post.ID}`}
              >
                <PostCard
                  post={post}
                  variant={"list"}
                  highlightText={highlightedText}
                />
              </Link>
            );
          })}

        {selected === "posts" &&
          !posts.fetching &&
          posts.data?.length === 0 &&
          !posts.error && (
            <h3 className="text-neutral-400 mt-4 font-normal text-base text-center">
              No posts found.
            </h3>
          )}

        {selected === "posts" && (
          <div className="flex justify-center items-center">
            <LoadOrRetry
              fetching={posts.fetching}
              error={posts.error}
              refetch={() => fetchPosts(searchedQuery)}
              className="mt-4"
            />
          </div>
        )}
        {/* Used for communities here */}

        {selected === "communities" &&
          communities.data?.map((community, index) => {
            return (
              <Link
                key={
                  "community " +
                  community.GameID +
                  community.TitleID +
                  "index " +
                  index
                }
                className={`flex p-2 ${
                  index === communities.data.length - 1
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

        {selected === "communities" &&
          !communities.fetching &&
          communities.data?.length === 0 &&
          !communities.error && (
            <h3 className="text-neutral-400 mt-4 font-normal text-base text-center">
              No communities found.
            </h3>
          )}

        {selected === "communities" && (
          <div className="flex justify-center items-center">
            <LoadOrRetry
              fetching={communities.fetching}
              error={communities.error}
              refetch={() => fetchCommunities(searchedQuery)}
              className="mt-4"
            />
          </div>
        )}
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
