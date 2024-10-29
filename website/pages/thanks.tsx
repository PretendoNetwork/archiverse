import SEO from "@/components/SEO";
import Wrapper from "@components/Wrapper";
import { LINKS } from "@constants/constants";
import AppreciationCard from "@components/AppreciationCard";
import { logServerStats } from "@server/logger";

export default function Home() {
  return (
    <>
      <SEO title={"Appreciations"} />
      <Wrapper>
        <div className="flex bg-[#f6f6f6] text-neutral-700 font-semibold border-b-[1px] border-gray mt-[-16px] mx-[-16px] px-2 py-1 text-base">
          Appreciations
        </div>
        <AppreciationCard
          miiName={"Kyle / SuperFX"}
          subName={"Archiverse's Developer"}
          text="Developed and currently maintains the website you see right now!"
          miiUrl={"superfx.png"}
          socialLink={LINKS.superfx}
        />
        <div className="border-t-[1px] border-gray" />

        <AppreciationCard
          miiName={"luna"}
          subName={"Archiverse's Designer"}
          text={
            "Created the Archiverse logo, guided Archiverse's UI design, wrote the FAQ page content, and currently moderates the Archiverse Discord server."
          }
          miiUrl={"luna.png"}
          socialLink={LINKS.luna}
        />
        <div className="border-t-[1px] border-gray" />
        <AppreciationCard
          miiName={"Tim / Drastic Actions"}
          text={
            "Created the original Archiverse website (archiverse.guide) and ran it from 2018 - 2024 until Kyle / SuperFX's takeover."
          }
          subName={"Archiverse's Original Creator (2018-2024)"}
          miiUrl={"drasticactions.png"}
          socialLink={LINKS.drasticactions}
        />
        <div className="border-t-[1px] border-gray" />
        <AppreciationCard
          miiName={"Archive Team"}
          subName={"Archiverse's Data Supplier"}
          text={
            "Archived 5 years of Miiverse data onto Internet Archive, making this website possible."
          }
          miiUrl={"archiveteam.png"}
          socialLink={LINKS.archiveteam}
        />
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
