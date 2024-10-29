import React, { useState, useEffect } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { Post } from "@server/database";
import PostCard from "./PostCard";
import Link from "next/link";
import { usePageCache } from "@hooks/usePageCache";

type HomepageDrawingsProps = {
  posts: Post[];
};

const HomepageDrawings = ({ posts }: HomepageDrawingsProps) => {
  const { pageCache, cachePageData } = usePageCache();

  const [currentIndex, setCurrentIndex] = useState(
    pageCache("/", "currentIndex") ?? 0
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only set the client-side rendering flag after the component has mounted
    setIsClient(true);
  }, []);

  useEffect(() => {
    cachePageData("/", "currentIndex", currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (isClient) {
      const intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
      }, 8500);

      return () => clearInterval(intervalId);
    }
  }, [isClient, posts.length]);

  if (!isClient) {
    return null; // Don't render anything on the server
  }

  const currentPost = posts[currentIndex];

  return (
    <div className="relative w-full h-full">
      <div className="transition-height duration-1000 ease-in-out mt-3 mb-4 h-[218px]">
        {currentPost && (
          <TransitionGroup component={null}>
            <CSSTransition
              key={currentPost.ID}
              timeout={1000}
              classNames="fade"
            >
              <Link href={`/posts/${currentPost?.ID}`}>
                <PostCard post={currentPost} variant={"carossel"} />
              </Link>
            </CSSTransition>
          </TransitionGroup>
        )}
      </div>
    </div>
  );
};

export default HomepageDrawings;
