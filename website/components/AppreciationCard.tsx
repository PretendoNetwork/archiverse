import { IMAGES, SEO_METADATA } from "@/constants/constants";
import { Post } from "@server/database";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import Loading from "@/components/Loading"; // Make sure to adjust the import path as needed
import Link from "next/link";
import MiiverseSymbol from "./MiiverseSymbol";
import Highlighter from "react-highlight-words";

interface PostCardProps {
  miiName: string;
  subName: string;
  text?: string;
  miiUrl: string;
  screenshotUrl?: string;
  socialLink?: string;
  className?: any;
}

const AppreciationCard = (props: PostCardProps) => {
  const [isScreenshotLoading, setIsScreenshotLoading] = useState(true);

  useEffect(() => {
    if (props.screenshotUrl) {
      const img = new Image();
      img.src = props.screenshotUrl;
      img.onload = () => setIsScreenshotLoading(false);
      img.onerror = () => setIsScreenshotLoading(false);
    } else {
      setIsScreenshotLoading(false);
    }
  }, [props.screenshotUrl]);

  return (
    <div
      className={`w-full md:px-2 ${props.className} mt-3 mb-3
      }`}
    >
      <div className={`flex items-center relative mb-2`}>
        {props.socialLink ? (
          <Link
            href={props.socialLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={props.miiUrl}
              className="w-[50px] h-[50px] rounded-md border-gray border-[1px] mr-5"
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = IMAGES.unknownMii;
              }}
            />
          </Link>
        ) : (
          <img
            src={props.miiUrl}
            className="w-[50px] h-[50px] rounded-md border-gray border-[1px] mr-5"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = IMAGES.unknownMii;
            }}
          />
        )}
        <div className="w-full">
          <div className="flex justify-between items-center">
            {props.socialLink ? (
              <Link
                className={`font-bold text-black text-base hover:underline
              `}
                href={props.socialLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {props.miiName}
              </Link>
            ) : (
              <h1 className="font-bold text-black text-base">
                {props.miiName}
              </h1>
            )}
          </div>
          <div className="flex items-center ">
            <h1 className="flex">
              <h1 className="font-normal text-[#969696] md:text-xs text-[10px]">
                {props.subName}
              </h1>
            </h1>
          </div>
        </div>
      </div>

      {props.text && (
        <h1 className={`text-left text-sm whitespace-pre-line`}>{props.text}</h1>
      )}

      {props.screenshotUrl &&
        (isScreenshotLoading ? (
          <div className="flex justify-center items-center mt-4 md:h-[266px] h-[160px]">
            <Loading />
          </div>
        ) : (
          <div className="flex justify-center items-center mt-4 md:h-[266px] h-[160px]">
            <img
              className="rounded-md max-w-full h-auto max-h-full"
              src={props.screenshotUrl}
            />
          </div>
        ))}
    </div>
  );
};

export default AppreciationCard;
