import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider, useDispatch } from "react-redux";
import store, {
  clickBrowserButtons,
  notClickBrowserButtons,
} from "../redux/store";
import Router, { useRouter } from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css"; // Import the nprogress CSS
import { useEffect, useRef } from "react";
import Script from "next/script";
import { SETTINGS } from "@constants/constants";
import Maintenance from "./maintenance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosResponse, AxiosStatic } from "axios";

NProgress.configure({ showSpinner: false });

const handleRouteChangeStart = () => {
  NProgress.start();
};

const handleRouteChangeComplete = () => {
  NProgress.done();
};

const handleRouteChangeError = () => {
  NProgress.done();
};

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const isPopState = useRef(false);

  useEffect(() => {
    const checkWaybackMachineStatus = async () => {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out after 7 seconds")), 7000)
      );
  
      try {
        const response: AxiosResponse = await Promise.race([
          axios.get("https://archive.org/wayback/available?url=miiverse.nintendo.net"),
          timeout
        ]) as AxiosResponse;
  
        if (!response || response.status !== 200) {
          throw new Error("Wayback Machine is down");
        }
  
        if (
          !response.data ||
          !response.data.archived_snapshots ||
          Object.keys(response.data.archived_snapshots).length === 0
        ) {
          throw new Error("Wayback Machine is down");
        }
      } catch (error) {
        console.log("Wayback machine error:", error?.message);
        // Show toast notification if there's an issue
        toast.error(
          "Wayback Machine is down. Some images may not load correctly.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
      }
    };
  
    // checkWaybackMachineStatus();
  
    Router.events.on("routeChangeStart", handleRouteChangeStart);
    Router.events.on("routeChangeComplete", handleRouteChangeComplete);
    Router.events.on("routeChangeError", handleRouteChangeError);
  
    return () => {
      Router.events.off("routeChangeStart", handleRouteChangeStart);
      Router.events.off("routeChangeComplete", handleRouteChangeComplete);
      Router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, []);
  

  // It is NOT this

  useEffect(() => {
    const handlePopState = () => {
      // This handles the back and forward buttons
      isPopState.current = true;
      dispatch(clickBrowserButtons({}));
    };

    router.beforePopState(() => {
      handlePopState();
      return true;
    });

    router.events.on("routeChangeComplete", () => {
      // This handles all route changes
      if (!isPopState.current) {
        dispatch(notClickBrowserButtons({}));
      }
      isPopState.current = false;
    });

    return () => {
      router.events.off("routeChangeComplete", () => {
        if (!isPopState.current) {
          dispatch(notClickBrowserButtons({}));
        }
        isPopState.current = false;
      });
    };
  }, [router]);

  return (
    <>
      {SETTINGS.Maintenance ? <Maintenance /> : <Component {...pageProps} />}
      {process.env.NODE_ENV === "production" && (
        <Script
          async
          src="https://stats.superfx.dev/script.js"
          data-website-id="4b461fac-17ee-49ed-8c67-76a1d7e846e7"
        />
      )}
      <ToastContainer />
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <Provider store={store}>
      <MyApp {...props} />
    </Provider>
  );
}
