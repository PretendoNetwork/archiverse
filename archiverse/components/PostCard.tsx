import { IMAGES, SEO_METADATA } from "@/constants/constants";
import { Post } from "@server/database";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import Loading from "@/components/Loading"; // Make sure to adjust the import path as needed
import Link from "next/link";
import MiiverseSymbol from "./MiiverseSymbol";
import Highlighter from "react-highlight-words";

interface PostCardProps {
  post: Post;
  className?: any;
  variant: "list" | "main" | "carossel";
  highlightText?: string;
}

const PostCard = ({
  post,
  className = "",
  variant,
  highlightText,
}: PostCardProps) => {
  const [isDrawingLoading, setIsDrawingLoading] = useState(true);
  const [isScreenshotLoading, setIsScreenshotLoading] = useState(true);

  const realTitle = post.Title ? post.Text?.trim() : null;
  const realDescription = post.Title ? post.Title?.trim() : post.Text?.trim();

  function getDate() {
    if (!post?.Date) {
      return "";
    }

    const d = new Date(post.Date);

    if (isNaN(d.getTime())) {
      return "";
    }
    const months = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ];

    const month = months[d.getMonth()];
    const day = d.getDate().toString().padStart(2, "0");
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strTime =
      hours.toString().padStart(2, "0") + ":" + minutes + " " + ampm;

    return `${month}/${day}/${year} ${strTime}`;
  }

  useEffect(() => {
    if (post.DrawingUrl) {
      const img = new Image();
      img.src = post.DrawingUrl;
      img.onload = () => setIsDrawingLoading(false);
      img.onerror = () => setIsDrawingLoading(false);
    } else {
      setIsDrawingLoading(false);
    }

    if (post.ScreenshotUrl) {
      const img = new Image();
      img.src = post.ScreenshotUrl;
      img.onload = () => setIsScreenshotLoading(false);
      img.onerror = () => setIsScreenshotLoading(false);
    } else {
      setIsScreenshotLoading(false);
    }
  }, [post.DrawingUrl, post.ScreenshotUrl]);

  if (variant === "list" && post.DoNotShow) {
    return <div />;
  }

  if (variant === "list" || variant === "carossel") {
    return (
      <div
        className={`w-full md:px-2 ${className} ${
          variant === "list" ? "mt-3" : ""
        }`}
      >
        <div className={`flex items-center relative mb-4`}>
          <Link href={`/users/${post.NNID}`} className="mr-2">
            <img
              src={post.MiiUrl}
              className="w-[50px] h-[50px] rounded-md border-gray border-[1px] mr-3"
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = IMAGES.unknownMii;
              }}
            />
          </Link>
          <div className="w-full">
            <div className="flex justify-between items-center">
              <Link
                className="font-bold text-black text-sm hover:underline"
                href={`/users/${post.NNID}`}
              >
                {post.MiiName}
              </Link>
              <h1 className="text-[10px] text-right text-neutral-400 font-medium absolute right-0 top-0">
                {getDate()}
              </h1>
            </div>
            <div className="flex mt-1 items-center ">
              <Link
                className="hover:underline flex"
                href={`/titles/${post.TitleID}/${post.GameID}`}
              >
                <img
                  src={post.CommunityIconUrl}
                  className="h-4 w-4 border-[1px] rounded-sm border-gray"
                />
                <h1 className="font-normal text-[#969696] md:text-xs text-[10px] ml-1">
                  {post.CommunityTitle}
                </h1>
              </Link>
            </div>
          </div>
        </div>
        {realTitle && (
          <h1 className="text-left font-bold text-lg">
            {" "}
            <Highlighter
              searchWords={[highlightText]}
              autoEscape={true}
              textToHighlight={realTitle}
            />
          </h1>
        )}
        {post.DrawingUrl ? (
          isDrawingLoading ? (
            <div className="flex justify-center items-center h-[120px]">
              <Loading />
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <img src={post.DrawingUrl} />
            </div>
          )
        ) : (
          <h1 className={`text-left whitespace-pre-line`}>
            <Highlighter
              searchWords={[highlightText]}
              autoEscape={true}
              textToHighlight={realDescription}
            />
          </h1>
        )}
        {variant === "list" &&
          post.ScreenshotUrl &&
          (isScreenshotLoading ? (
            <div className="flex justify-center items-center mt-4 md:h-[266px] h-[160px]">
              <Loading />
            </div>
          ) : (
            <div className="flex justify-center items-center mt-4 md:h-[266px] h-[160px]">
              <img
                className="rounded-md max-w-full h-auto max-h-full"
                src={post.ScreenshotUrl}
              />
            </div>
          ))}
        {variant === "list" && post.VideoUrl && (
          <div className="flex justify-center items-center mt-4">
            <div className="relative w-full pb-[56.25%]">
              <iframe
                title="YouTube video"
                className="absolute top-0 left-0 w-full h-full rounded-md"
                src={post.VideoUrl}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
        <div className="flex justify-between items-center text-[#969696] text-sm mt-3 mb-2">
          <div className="space-x-2 justify-center items-center">
            {post.WebArchiveUrl && (
              <Link
                href={post.WebArchiveUrl}
                className="hover:underline text-[10px]"
              >
                Web Archive
              </Link>
            )}
            {post.WarcLocationUrl && (
              <Link
                href={post.WarcLocationUrl}
                className="hover:underline text-[10px]"
              >
                WARC
              </Link>
            )}
          </div>
          <div className="flex items-center">
            <MiiverseSymbol
              className="w-[14px] h-[14px] fill-[#969696] mr-[3px]"
              symbol={"person_happy"}
            />
            {post.NumYeahs}
            <MiiverseSymbol
              className="w-4 h-4 fill-[#969696] ml-3 mr-[3px]"
              symbol={"comment_reply"}
            />
            {post.NumReplies}
            {post.IsPlayed && (
              <MiiverseSymbol
                className="ml-3 mb-[.5px] w-5 h-5 fill-[#969696]"
                symbol={"online_check"}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`w-full md:px-2 ${className} mt-3`}>
      <div className="flex items-center relative mb-4">
        <Link href={`/users/${post.NNID}`} className="mr-2">
          <img
            src={post.MiiUrl}
            className="w-[50px] h-[50px] rounded-md border-gray border-[1px] mr-3"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = IMAGES.unknownMii;
            }}
          />
        </Link>
        <div className="w-full">
          <div className="flex items-center">
            <Link
              className="font-bold text-black text-[17px] hover:underline"
              href={`/users/${post.NNID}`}
            >
              {post.MiiName}
            </Link>
            <h1 className="text-left ml-2 mt-[.5px] text-neutral-400 font-medium text-[13px] break-words">
              {post.NNID}
            </h1>
          </div>
          <h1 className="text-left mt-[-2px] text-neutral-400 font-medium text-[13px] break-words">
            {getDate()}
          </h1>
        </div>
      </div>
      {realTitle && (
        <h1 className="text-left font-bold text-lg">{realTitle}</h1>
      )}
      {post.DrawingUrl ? (
        isDrawingLoading ? (
          <div className="flex justify-center items-center h-[120px]">
            <Loading />
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <img src={post.DrawingUrl} />
          </div>
        )
      ) : (
        <h1 className={`text-left whitespace-pre-line`}>{realDescription}</h1>
      )}
      {post.ScreenshotUrl &&
        (isScreenshotLoading ? (
          <div className="flex justify-center items-center mt-4 md:h-[266px] h-[160px]">
            <Loading />
          </div>
        ) : (
          <div className="flex justify-center items-center mt-4 md:h-[266px] h-[160px]">
            <img
              className="rounded-md max-w-full h-auto max-h-full"
              src={post.ScreenshotUrl}
            />
          </div>
        ))}
      {post.VideoUrl && (
        <div className="flex justify-center items-center mt-4">
          <div className="relative w-full pb-[56.25%]">
            <iframe
              title="YouTube video"
              className="absolute top-0 left-0 w-full h-full rounded-md"
              src={post.VideoUrl}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
      <div className="flex justify-between items-center text-[#969696] text-sm mt-3 mb-2">
        <div className="space-x-2 justify-center items-center">
          {post.WebArchiveUrl && (
            <Link
              href={post.WebArchiveUrl}
              className="hover:underline text-[10px]"
            >
              Web Archive
            </Link>
          )}
          {post.WarcLocationUrl && (
            <Link
              href={post.WarcLocationUrl}
              className="hover:underline text-[10px]"
            >
              WARC
            </Link>
          )}
        </div>
        <div className="flex items-center">
          <MiiverseSymbol
            className="w-[14px] h-[14px] fill-[#969696] mr-[3px]"
            symbol={"person_happy"}
          />
          {post.NumYeahs}
          <MiiverseSymbol
            className="w-4 h-4 fill-[#969696] ml-3 mr-[3px]"
            symbol={"comment_reply"}
          />
          {post.NumReplies}
          {post.IsPlayed && (
            <MiiverseSymbol
              className="ml-3 mb-[.5px] w-5 h-5 fill-[#969696]"
              symbol={"online_check"}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
