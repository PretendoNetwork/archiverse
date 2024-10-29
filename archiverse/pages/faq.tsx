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
import { IMAGES, LINKS } from "@constants/constants";
import MiiverseSymbol from "@components/MiiverseSymbol";
import PostCard from "@components/PostCard";
import { usePageCache } from "@hooks/usePageCache";
import { logServerStats } from "@server/logger";

export default function Home() {
  const Question = ({ children }) => (
    <div className="mt-4 flex justify-between border-b-4 mx-[-16px] px-4 py-2 border-green mb-3 items-end">
      <h1 className="text-green font-bold sm:text-lg text-sm">{children}</h1>
    </div>
  );

  const Answer = ({ children }) => (
    <p className="text-neutral-700 font-medium text-sm mt-2">{children}</p>
  );

  return (
    <>
      <SEO title={"FAQ"} />
      <Wrapper>
        <div className="flex bg-[#f6f6f6] text-neutral-700 font-semibold border-b-[1px] border-gray mt-[-16px] mx-[-16px] px-2 py-1 text-base">
          FAQ
        </div>
        <Question>What is Archiverse?</Question>
        <Answer>
          Archiverse is a website that allows users to access an archive of
          Miiverse, a social media platform for the Wii U and Nintendo 3DS
          systems. Miiverse was open from November 18, 2012 to November 8, 2017.
          This archive stores millions of Miiverse users, posts, drawings,
          comments, and more, totaling over 17TB of data.
        </Answer>
        <Question>Who runs Archiverse? </Question>
        <Answer>
          Archiverse is currently maintained by Kyle / SuperFX. Archiverse is
          not associated with Nintendo in any way. You can find a list of people
          who have allowed Archiverse to come to fruition & supported the
          project{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={"/thanks"}
          >
            here
          </Link>
          .
        </Answer>
        <Question>What happened to archiverse.guide? </Question>
        <Answer>
          Archiverse.guide was a site similar to archiverse.app, which allowed
          users to access the Miiverse archive. The owner of the site,{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.drasticactions}
          >
            Drastic Actions
          </Link>
          , was no longer able to maintain it, and thus the site was shut down
          sometime in 2024. The previous owner has since allowed Kyle / SuperFX
          use of the Archiverse name, as well as the archiverse.guide domain.
        </Answer>
        <Question>Why run Archiverse?</Question>
        <Answer>
          Miiverse was a pivotal part of many people's experiences when playing
          on Wii U or Nintendo 3DS systems. Many people, including those who
          have made Archiverse possible, have fond memories of interacting with
          friends, sharing fun moments, and looking at absurd interactions on
          the site. By allowing others to access them easily, we hope that
          others may find joy in reminiscing over their old profile, discovering
          new content, or simply checking out a very important part of internet
          history!
        </Answer>
        <Question>How can I support Archiverse?</Question>
        <Answer>
          Running Archiverse is a bit costly, and relies on contributions from
          its users to keep running. If you support what Archiverse is doing,
          you can support us financially by{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.kofi}
          >
            donating at Ko-fi
          </Link>
          . Alternatively, you can{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={
              "https://twitter.com/intent/tweet?text=Check%20out%20an%20archive%20of%20%23Miiverse%20at%20https%3A%2F%2Farchiverse.app%20!&url="
            }
          >
            Tweet about Archiverse
          </Link>
          ,{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.github}
          >
            star the GitHub repository
          </Link>
          ,{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.discord}
          >
            Join our Discord server
          </Link>
          , or tell your friends about Archiverse!
        </Answer>
        <Question>Why don't some of my old posts show up?</Question>
        <Answer>
          Archiverse is made possible from an archive of Miiverse provided by{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.archiveteam}
          >
            Archive Team
          </Link>
          . This archive was captured shortly before Miiverse shut down, meaning
          that some posts made shortly before Miiverse closed are not available
          to be seen on Archiverse, as they are not in our database.
          Alternatively, some posts may have been deleted by you or removed by
          Miiverse moderators before the site was archived. There may be a
          chance that some replies on posts may have not been fully archived as
          well.
        </Answer>
        <Question>Can I use Archiverse for personal projects?</Question>
        <Answer>
          Yes! Feel free to use & share screenshots or snippets of Archiverse
          for personal projects. If you need any assets from the site, you can
          request them on the{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.discord}
          >
            Archiverse Discord server
          </Link>
          .
        </Answer>
        <Question>How do I suggest a feature?</Question>
        <Answer>
          We'd love to hear any suggestions you may have for the site! You can
          suggest features for Archiverse on the “Suggestions” channel of the{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.discord}
          >
            Archiverse Discord server
          </Link>
          .
        </Answer>
        <Question>I have another question!</Question>
        <Answer>
          Ask us on the{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.discord}
          >
            Archiverse Discord server
          </Link>
          . If we get asked it enough we may add it to this page!
        </Answer>
        <div className="h-4" />
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
