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
import { logServerStats } from "@server/logger";

export default function Home() {
  return (
    <>
      <SEO title={"404"} makeDescriptionBlank={true} />
      <Wrapper>
        <h1 className="text-center font-bold text-lg text-neutral-800 mt-2">
          {"Sorry! That page does not exist :("}
        </h1>
        <div className="flex justify-center items-center mt-4 mb-4">
          <Link
            className="md:ml-2 hover:brightness-95 inline-flex justify-center items-center bg-gradient-to-b from-white border-[1px] rounded-md border-gray text-neutral-600 to-neutral-200 font-medium py-2 px-8 mt-4 md:mt-0 md:text-base text-small"
            href={"/"}
          >
            <h1 className="">Go Home</h1>
          </Link>
        </div>
      </Wrapper>
    </>
  );
}