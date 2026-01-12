import SEO from "@/components/SEO";
import { Community, Post, Reply, getPost } from "@server/database";
import Wrapper from "@components/Wrapper";
import LoadOrRetry from "@components/LoadOrRetry";
import { useEffect, useRef, useState } from "react";
import { queryAPI } from "@utils/queryAPI";
import { numberWithCommas } from "@utils/utils";
import Link from "next/link";
import PostCard from "@components/PostCard";
import ReplyCard from "@components/ReplyCard";
import { LIMIT } from "@constants/constants";
import Loading from "@components/Loading";
import {
  LuArrowDown,
  LuArrowDownToLine,
  LuArrowRightToLine,
  LuArrowUp,
  LuArrowUpToLine,
} from "react-icons/lu";
import MiiverseSymbol from "@components/MiiverseSymbol";
import { usePageCache } from "@hooks/usePageCache";
import AdBanner from "@components/AdBanner";
import { logServerStats } from "@server/logger";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

export default function Home({
  post_id,
  post,
}: {
  post_id: string;
  post: Post;
}) {
  const { pageCache, cachePageData } = usePageCache();
  const router = useRouter();

  const [highlightReplyId, setHighlightReplyId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  const [scrollTargetReplyId, setScrollTargetReplyId] = useState<string | null>(
    null
  );
  const [checkedScrollTarget, setCheckedScrollTarget] = useState(false);

  const [replies, setReplies] = useState<{
    data: Reply[];
    fetching: boolean;
    error: string;
    currPage: number;
    showMoreCategory: "old" | "new";
    canPullMore: boolean;
    allLoaded: boolean;
  }>(
    pageCache(`posts/${post_id}`, "replies") ?? {
      data: null,
      fetching: false,
      error: null,
      showMoreCategory: "old", // This is only used to show where to show the loading indicator. This value is not used elsewhere. old is top. new is bottom
      currPage: 1,
      canPullMore: false,
      allLoaded: false,
    }
  );

  const fetchReplies = async (
    reset: boolean,
    mode: "oldest" | "newest",
    category: "old" | "new"
  ) => {
    var page = 1;
    if (!reset) {
      page = replies.currPage + 1;
    }

    if (replies.fetching) {
      return;
    }

    setReplies((prevState) => ({
      ...prevState,
      fetching: true,
      error: null,
    }));

    const { data, error } = await queryAPI<Reply[]>(
      `replies?post_id=${post_id}&sort_mode=${mode}&page=${page}`
    );

    if (error) {
      setReplies((prevState) => ({
        ...prevState,
        fetching: false,
        currPage: page - 1,
        error: error,
        canPullMore: true,
      }));
      return;
    }

    const prevData = replies.data ? replies.data : [];

    let newData;
    if (mode === "newest") {
      const reversedData = [...data].reverse();
      newData = reset ? reversedData : [...reversedData, ...prevData];
    } else {
      newData = reset ? data : [...prevData, ...data];
    }

    setReplies((prevState) => ({
      ...prevState,
      data: newData,
      currPage: page,
      fetching: false,
      error: null,
      canPullMore: data.length === LIMIT.PostReplies,
      showMoreCategory: category,
      allLoaded: false,
    }));
  };

  const fetchAllRepliesForScroll = async () => {
    if (replies.fetching) {
      return;
    }

    setReplies((prevState) => ({
      ...prevState,
      fetching: true,
      error: null,
    }));

    // Fetch a large set in a single request, then render chronologically for stable scrolling.
    const { data, error } = await queryAPI<{
      replies: Reply[];
      total: number | null;
      hasMore: boolean;
    }>(
      `replies?post_id=${post_id}&sort_mode=oldest&all=true`
    );

    if (error) {
      setReplies((prevState) => ({
        ...prevState,
        fetching: false,
        error: error,
        allLoaded: false,
      }));
      return;
    }

    const allReplies = data?.replies ?? [];
    const hasMore = data?.hasMore ?? false;
    const missingTarget =
      !!scrollTargetReplyId &&
      !allReplies.some((r) => r.ID === scrollTargetReplyId);

    setReplies((prevState) => ({
      ...prevState,
      data: allReplies,
      currPage: 1,
      fetching: false,
      // If the target isn't present, don't fail silently.
      error: missingTarget
        ? `Couldn't find that reply in the loaded comments${
            hasMore ? " yet" : ""
          }.`
        : null,
      canPullMore: hasMore,
      allLoaded: !hasMore,
      showMoreCategory: "new",
    }));
  };

  useEffect(() => {
    // Only scroll when we navigated from a profile reply click.
    if (typeof window !== "undefined") {
      try {
        const key = `scrollToReply:${post_id}`;
        const stored = window.sessionStorage.getItem(key);
        if (stored) {
          window.sessionStorage.removeItem(key); // one-shot so back/forward doesn't re-trigger
          setScrollTargetReplyId(stored);
        }
      } catch {
        // ignore (storage disabled)
      }
    }
    setCheckedScrollTarget(true);
  }, [post_id]);

  useEffect(() => {
    // Initial load: wait until we've checked sessionStorage so we don't accidentally start the paginated fetch.
    if (!checkedScrollTarget) {
      return;
    }
    if (replies.data) {
      return;
    }

    if (scrollTargetReplyId) {
      fetchAllRepliesForScroll();
    } else {
      fetchReplies(true, "newest", "old");
    }
  }, [checkedScrollTarget, scrollTargetReplyId]);

  useEffect(() => {
    // If we first loaded paginated replies but then discover we need to scroll to a specific reply,
    // upgrade to the "fetch all" path to guarantee the target is in the DOM.
    if (!checkedScrollTarget) return;
    if (!scrollTargetReplyId) return;
    if (!replies.data) return;
    if (replies.allLoaded) return;
    fetchAllRepliesForScroll();
  }, [checkedScrollTarget, scrollTargetReplyId]);

  useEffect(() => {
    cachePageData(`posts/${post_id}`, "replies", replies);
  }, [replies]);

  useEffect(() => {
    if (!scrollTargetReplyId) {
      return;
    }
    if (!replies.data) {
      return;
    }

    // Scroll once the target reply exists in the DOM.
    const el = document.getElementById(`reply-${scrollTargetReplyId}`);
    if (!el) {
      return;
    }

    // If we're highlighting a new reply, cancel any previous auto-clear timer.
    if (highlightTimeoutRef.current != null) {
      window.clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    setHighlightReplyId(scrollTargetReplyId);
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightReplyId(null);
      highlightTimeoutRef.current = null;
    }, 2500);
  }, [scrollTargetReplyId, replies.data?.length]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (highlightTimeoutRef.current != null) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <SEO
        title={post.MiiName + "'s Post"}
        description={
          post.Text ??
          `Check out ${post.MiiName}'s post on Archiverse, the largest Miiverse archive on the internet.`
        }
        isImageBig={post.ScreenshotUrl || post.DrawingUrl ? true : false}
        imageUrl={post.DrawingUrl ?? post.ScreenshotUrl ?? post.MiiUrl}
      />
      <Wrapper>
        <div className="md:mx-[-16px] my-[-16px]">
          <Link
            className="flex bg-[#f6f6f6] text-neutral-700 font-semibold md:rounded-t-md p-2 border-gray border-b-[1px] md:text-base text-sm  md:mx-0 mx-[-16px] items-center hover:underline"
            href={`/titles/${post.TitleID}/${post.GameID}`}
          >
            <img
              src={post.CommunityIconUrl}
              className="h-6 w-6 rounded-sm mr-2"
            />
            {post?.CommunityTitle}
          </Link>
          <div className="md:mx-2">
            <PostCard post={post} variant="main" />
          </div>
          <div className="md:mx-0 mx-[-16px]">
            <AdBanner/>
          </div>
          {replies.data && replies.data.length !== 0 && (
            <div className="bg-[#5ac800] border-y-[1px] border-t-[#4faf00] border-b-gray flex py-1 text-sm text-white px-2 md:mx-0 mx-[-16px]">
              Comments
            </div>
          )}
          {replies.fetching && !replies.data ? (
            <div className="w-full items-center flex justify-center py-3 mb-3">
              <Loading />
            </div>
          ) : (
            <div>
              {replies.error && (
                <div className="mx-4 md:mx-2 my-2 text-xs text-neutral-500">
                  {replies.error}
                  {scrollTargetReplyId && replies.canPullMore && (
                    <span>
                      {" "}
                      Try loading more comments (e.g. “View newer comments”) to
                      reach it.
                    </span>
                  )}
                </div>
              )}
              {replies.canPullMore &&
                !replies.allLoaded &&
                replies.showMoreCategory === "old" && (
                <div className="flex flex-col mx-[-16px]">
                  {!replies.fetching ? (
                    <>
                      <button
                        onClick={() => fetchReplies(true, "oldest", "new")}
                        className="flex items-center justify-center font-bold py-2 border-b-[1px] border-gray hover:bg-neutral-100 text-sm"
                      >
                        <MiiverseSymbol
                          className="mr-2 h-4 w-4"
                          symbol={"upbar"}
                        />
                        View oldest comments
                      </button>
                      <button
                        onClick={() => fetchReplies(false, "newest", "old")}
                        className="flex items-center justify-center font-bold py-2 border-b-[1px] border-gray hover:bg-neutral-100 text-sm"
                      >
                        <MiiverseSymbol
                          className="mr-2 h-4 w-4"
                          symbol={"up"}
                        />
                        View older comments
                      </button>
                    </>
                  ) : (
                    <div className="w-full items-center flex justify-center border-b-[1px] border-gray py-3">
                      <Loading />
                    </div>
                  )}
                </div>
              )}
              {replies.data &&
                post &&
                replies.data.map((reply, index) => {
                  return (
                    <div
                      key={reply.ID + index + "div"}
                      id={`reply-${reply.ID}`}
                      className={`px-4 md:mx-[0px] mx-[-16px] ${
                        reply.NNID === post.NNID ? "bg-[#effbe7]" : ""
                      } ${
                        highlightReplyId === reply.ID
                          ? "ring-2 ring-[#5ac800] ring-inset"
                          : ""
                      }`}
                    >
                      <ReplyCard key={reply.ID + index} reply={reply} />
                      {index !== replies.data.length - 1 && (
                        <div className="border-b-[1px] mx-[-16px] border-gray" />
                      )}
                    </div>
                  );
                })}
              {replies.canPullMore &&
                !replies.allLoaded &&
                replies.showMoreCategory === "new" && (
                <div className="flex flex-col mx-[-16px]">
                  {!replies.fetching ? (
                    <>
                      <button
                        onClick={() => fetchReplies(false, "oldest", "new")}
                        className="flex items-center justify-center text-sm font-bold py-2 border-t-[1px] border-gray hover:bg-neutral-100"
                      >
                        <MiiverseSymbol
                          className="mr-2 h-4 w-4"
                          symbol={"down"}
                        />
                        View newer comments
                      </button>
                      <button
                        onClick={() => fetchReplies(true, "newest", "old")}
                        className="flex items-center justify-center text-sm font-bold py-2 border-t-[1px] border-gray hover:bg-neutral-100"
                      >
                        <MiiverseSymbol
                          className="mr-2 h-4 w-4"
                          symbol={"downbar"}
                        />
                        View newest comments
                      </button>
                    </>
                  ) : (
                    <div className="w-full items-center flex justify-center py-3 border-t-[1px] border-gray">
                      <Loading />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Wrapper>
    </>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  await logServerStats(context.req, context.res)

  const { post_id } = context.query;

  const post = await getPost({ postID: post_id });
  return {
    props: {
      post_id,
      post,
    },
  };
};
