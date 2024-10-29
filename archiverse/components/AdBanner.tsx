import { useEffect, useState } from "react";
import Script from "next/script";
import { LiaWindowClose } from "react-icons/lia";

export default function AdBanner() {

  // Ads are disabled, but to enable them, just remove this line
  return <></>
  const [isOpen, setIsOpen] = useState(true);
  const [showCloseButton, setShowCloseButton] = useState(false);

  useEffect(() => {
    if (window && (window as any).adsbygoogle) {
      console.log("Loading ad inside useEffect");

      try {
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.error("AdSense error", e);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCloseButton(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return <></>;

  return (
    <div className="relative bg-gray py-2 text-center md:px-2">
      <div className="absolute top-0 right-0 mr-2 mt-[6px]">
        {showCloseButton && (
          <button onClick={() => setIsOpen(false)}>
            <LiaWindowClose size={18} />
          </button>
        )}
      </div>
      <div className="flex justify-center mb-2">
        <h2 className="text-neutral-400 text-[10px]">
          Ads help maintain Archiverse's server costs
        </h2>
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4203889559099732"
        data-ad-format="horizontal"
        data-ad-slot="1525315872"
        data-full-width-responsive="false"
      ></ins>
    </div>
  );
}
