import SEO from "@/components/SEO";
import Link from "next/link";
import Wrapper from "@components/Wrapper";
import { LINKS } from "@constants/constants";
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
          Archiverse is a website that allows users to access an archive of Miiverse, a social media platform for the Wii U and Nintendo 3DS systems. Miiverse was open from November 18, 2012, to November 8, 2017. This archive stores millions of Miiverse users, posts, drawings, comments, and more, totaling over 17TB of data.
        </Answer>
        <Question>Who runs Archiverse?</Question>
        <Answer>
          Archiverse is currently maintained by the Pretendo team. Archiverse is not associated with Nintendo in any way. You can find a list of people who have allowed Archiverse to come to fruition & supported the project{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={"/thanks"}
          >
            here
          </Link>.
        </Answer>
        <Question>What happened to the old sites (archiverse.guide/.app)?</Question>
        <Answer>
          Archiverse.guide was a site similar to archiverse.app, which allowed users to access the Miiverse archive. The site's owner,{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.drasticactions}
          >
            Drastic Actions
          </Link>, could no longer maintain it, and thus the site was shut down sometime in 2024. The previous owner has since allowed Kyle / SuperFX to use the Archiverse name and the archiverse.guide domain. Since then, Archiverse has partnered with Pretendo to take over site operations to streamline and sustain operations.
        </Answer>
        <Question>How can I remove my profile from Archiverse?</Question>
        <Answer>
          Every service operated by Pretendo, including Archiverse, complies with GDPR standards. To request the removal of your content on the site, including the visibility of your profile, please submit a request for data removal on the{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.forum}
          >
            Pretendo Forums
          </Link>{" "}
          with the “GDPR” tag, and your data removal request will be processed as soon as possible.
        </Answer>
        <Question>Why run Archiverse?</Question>
        <Answer>
          Miiverse was a pivotal part of many people's experiences when playing on Wii U or Nintendo 3DS systems. Many people, including those who have made Archiverse possible, have fond memories of interacting with friends, sharing fun moments, and viewing unique interactions on the site. We hope they may find joy in reminiscing over their old profiles, discovering new content, or simply exploring this significant part of internet history!
        </Answer>
        <Question>How can I support Archiverse?</Question>
        <Answer>
          Running Archiverse is a bit costly and relies on contributions from its users. If you support what Archiverse and Pretendo are doing, you can help financially by{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.donate}
          >
            donating to Pretendo
          </Link>. You can also{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={"https://twitter.com/intent/tweet?text=Check%20out%20an%20archive%20of%20%23Miiverse%20at%20https%3A%2F%2Farchiverse.pretendo.network%20!&url="}
          >
            Tweet about Archiverse
          </Link>,{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.github}
          >
            star the GitHub repository
          </Link>,{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.discord}
          >
            Join the Pretendo Discord Server
          </Link>, or simply tell your friends about Archiverse!
        </Answer>
        <Question>Why don't some of my old posts show up?</Question>
        <Answer>
          Archiverse is made possible from an archive of Miiverse provided by{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.archiveteam}
          >
            Archive Team
          </Link>. This archive was captured shortly before Miiverse shut down, meaning that some posts made shortly before Miiverse closed are unavailable. Alternatively, some posts may have been deleted by you or removed by Miiverse moderators before the site was archived.
        </Answer>
        <Question>Can I use Archiverse for personal projects?</Question>
        <Answer>
          Yes! Feel free to use & share screenshots or snippets of Archiverse for personal projects. The Archiverse project hosted on pretendo.network has an AGPL-3.0 license.
        </Answer>
        <Question>I have another question!</Question>
        <Answer>
          Ask us on the{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.discord}
          >
            Pretendo Discord Server
          </Link>{" "}
          or the{" "}
          <Link
            className="text-blue-600 underline hover:text-blue-500"
            href={LINKS.forum}
          >
            Pretendo Forums
          </Link>. If we get asked it enough, we may add it to this page!
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
