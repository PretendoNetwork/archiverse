import { IMAGES, SEO_METADATA } from "@/constants/constants";
import { Post, Reply } from "@server/database";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import Loading from "@/components/Loading"; // Make sure to adjust the import path as needed
import Link from "next/link";
import MiiverseSymbol from "./MiiverseSymbol";

interface ReplyCardProps {
  reply: Reply;
  className?: any;
}

const ReplyCard = ({ reply, className = "" }: ReplyCardProps) => {
  const [isDrawingLoading, setIsDrawingLoading] = useState(true);
  const [isScreenshotLoading, setIsScreenshotLoading] = useState(true);

  function getDate() {
    if (!reply?.Date) {
      return "";
    }

    const d = new Date(reply.Date);

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
    if (reply.DrawingUrl) {
      const img = new Image();
      img.src = reply.DrawingUrl;
      img.onload = () => setIsDrawingLoading(false);
      img.onerror = () => setIsDrawingLoading(false);
    } else {
      setIsDrawingLoading(false);
    }

    if (reply.ScreenshotUrl) {
      const img = new Image();
      img.src = reply.ScreenshotUrl;
      img.onload = () => setIsScreenshotLoading(false);
      img.onerror = () => setIsScreenshotLoading(false);
    } else {
      setIsScreenshotLoading(false);
    }
  }, [reply.DrawingUrl, reply.ScreenshotUrl]);

  return (
    <div
      className={`${className} pb-2 pt-3
      }`}
    >
      <div className="flex items-center relative mb-3">
        <Link href={`/users/${reply.NNID}`} className="mr-2">
          <img
            src={reply.MiiUrl}
            className="w-[50px] h-[50px] rounded-md border-gray bg-white border-[1px] mr-3"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = IMAGES.unknownMii;
            }}
          />
        </Link>
        <div className="w-full">
          <div className="flex items-center">
            <Link
              className="font-bold text-black text-[14px] hover:underline"
              href={`/users/${reply.NNID}`}
            >
              {reply.MiiName}
            </Link>
            <h1 className="text-left ml-2 mt-[.5px] text-neutral-400 font-medium text-[11px]">
              {reply.NNID}
            </h1>
          </div>
          <h1 className="text-left mt-[-2px] text-neutral-400 font-medium text-[12px]">
            {getDate()}
          </h1>
        </div>
      </div>
      {reply.DrawingUrl ? (
        isDrawingLoading ? (
          <div className="flex justify-center items-center h-[120px]">
            <Loading />
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <img src={reply.DrawingUrl} />
          </div>
        )
      ) : (
        <h1 className={`text-left`}>{reply.Text}</h1>
      )}
      {reply.ScreenshotUrl &&
        (isScreenshotLoading ? (
          <div className="flex justify-center items-center mt-4 md:h-[266px] h-[160px]">
            <Loading />
          </div>
        ) : (
          <div className="flex justify-center items-center mt-4 md:h-[266px] h-[160px]">
            <img
              className="rounded-md max-w-full h-auto max-h-full"
              src={reply.ScreenshotUrl}
            />
          </div>
        ))}
      <div className="flex justify-between items-center text-[#969696] text-sm mt-3">
        <div>
          {reply.WarcLocationUrl && (
            <Link
              href={reply.WarcLocationUrl}
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
          {reply.NumYeahs}
          {reply.IsPlayed && (
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

export default ReplyCard;
