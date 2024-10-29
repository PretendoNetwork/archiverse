import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { cachePage, clearCache } from "../redux/store";
import { useRouter } from "next/router";

export function usePageCache() {
  const browser = useSelector((state) => (state as any).browser);
  const cache = useSelector((state) => (state as any).cache);
  const dispatch = useDispatch();

  const usedButtons = browser.clickedButtons

  function pageCache(path: string, key: string) {
    if (typeof window === "undefined") {
      return null; // Always return null on server-side
    }

    // Check popState navigation
    if (usedButtons && cache[path] && cache[path][key] !== undefined) {
      // Reset popState navigation
      const data = cache[path][key];
      return data;
    }

    return null;
  }

  function cachePageData(path: string, key: string, data: any) {
    if (typeof window === "undefined") {
      return; // Don't cache on server-side
    }
    dispatch(cachePage({ path, key, data }));
  }

  return { pageCache, cachePageData };
}
