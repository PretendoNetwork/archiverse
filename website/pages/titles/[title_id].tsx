import SEO from "@/components/SEO";
import { Community, Post } from "@server/database";
import Wrapper from "@components/Wrapper";
import LoadOrRetry from "@components/LoadOrRetry";
import { useEffect, useState } from "react";
import { queryAPI } from "@utils/queryAPI";
import { numberWithCommas } from "@utils/utils";
import Link from "next/link";
import MiiverseSymbol from "@components/MiiverseSymbol";
import { usePageCache } from "@hooks/usePageCache";
import { logServerStats } from "@server/logger";

export default function Home({ title_id }) {
  const { pageCache, cachePageData } = usePageCache();

  const [communities, setCommunities] = useState<{
    data: Community[];
    fetching: boolean;
    error: string;
  }>(
    pageCache(`titles/${title_id}`, "communities") ?? {
      data: null,
      fetching: false,
      error: null,
    }
  );

  const fetchCommunities = async () => {
    if (communities.fetching) {
      return;
    }
    setCommunities((prevState) => ({
      ...prevState,
      fetching: true,
      error: null,
    }));

    const { data, error } = await queryAPI<Community[]>(
      `communities?title_id=${title_id}`
    );

    if (error) {
      setCommunities((prevState) => ({
        ...prevState,
        fetching: false,
        error: error,
      }));
      return;
    }
    setCommunities((prevState) => ({
      ...prevState,
      data: data,
      fetching: false,
      error: null,
    }));
  };

  useEffect(() => {
    if (!communities.data) {
      fetchCommunities();
    }
  }, []);

  useEffect(() => {
    cachePageData(`titles/${title_id}`, "communities", communities);
  }, [communities]);

  function getGameTitle() {
    // Check if the array exists and has at least one element
    if (communities?.data && communities?.data?.length > 0) {
      // Return the first element of the array
      return communities.data[0].GameTitle;
    } else {
      // Return null if the array is empty or doesn't exist
      return null;
    }
  }

  const gameTitle = getGameTitle();

  return (
    <>
      <SEO title="Related Communities" makeDescriptionBlank={true} />
      <Wrapper>
        {gameTitle && (
          <div className="flex bg-[#f6f6f6] text-[#969696] border-b-[1px] border-gray font-semibold mt-[-16px] mx-[-16px] px-2 py-1 md:text-sm text-xs">
            {gameTitle}
          </div>
        )}
        <div className="flex justify-center items-center">
          <LoadOrRetry
            fetching={communities.fetching}
            error={communities.error}
            refetch={fetchCommunities}
            className="mt-4"
          />
        </div>

        {communities.data?.map((community, index) => {
          return (
            <Link
              key={"community " + community.GameID + community.TitleID}
              className={`flex py-2 ${
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
                      className="mr-[7px] h-[16px] w-[16px] fill-neutral-500 "
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

        {!communities.fetching &&
          communities.data &&
          communities.data?.length === 0 && (
            <h3 className="text-neutral-400 mt-[15px] mb-[6px] font-normal text-base">
              No communities found.
            </h3>
          )}

        <div className="mb-2" />
      </Wrapper>
    </>
  );
}

export const getServerSideProps = async (context) => {
  await logServerStats(context.req, context.res)


  const { title_id } = context.query;

  return {
    props: {
      title_id,
    },
  };
};
