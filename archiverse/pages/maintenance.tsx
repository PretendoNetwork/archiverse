import SEO from "@/components/SEO";
import Wrapper from "@components/Wrapper";
import { LINKS } from "@constants/constants";
import AppreciationCard from "@components/AppreciationCard";
import MiiverseSymbol from "@components/MiiverseSymbol";
import Link from "next/link";
import { logServerStats } from "@server/logger";

export default function Home() {
  return (
    <>
      <SEO title={"Maintenance"} />
      <Wrapper>
        <div className=" flex justify-center items-center mb-6 mt-4">
          <MiiverseSymbol
            className="w-[26px] h-[26px] fill-neutral-700 mr-3 mb-1"
            symbol={"settings"}
          />

          <h1 className="font-bold text-2xl text-neutral-700 text-center ">
            Maintenance in progress...
          </h1>
          <MiiverseSymbol
            className="w-[26px] h-[26px] fill-neutral-700 ml-3 mb-1"
            symbol={"settings"}
          />
        </div>
        <h1 className="font-semibold md:text-lg text-base text-neutral-900 text-center mb-4">
          Archiverse will be back online soon!
        </h1>
        <div className="flex justify-center items-center">
          <Link
            className="text-blue-600 text-sm underline hover:text-blue-500 text-center mb-4"
            href={LINKS.discord}
          >
            Join our Discord for updates
          </Link>
        </div>
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
