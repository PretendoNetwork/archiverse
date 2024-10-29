import React, { useEffect, useState } from "react";
import LoadingIcon from "./Loading";
import { VscDebugRestart } from "react-icons/vsc";

type LoadOrRetryProps = {
  fetching: boolean;
  error: string;
  refetch: () => void;
  className?: string;
};

const LoadOrRetry = ({
  fetching,
  error,
  refetch,
  className,
}: LoadOrRetryProps) => {
  if (fetching) {
    return (
      <div className={className}>
        <LoadingIcon />
      </div>
    );
  }
  if (error) {
    return (
      <button className={className} onClick={refetch}>
        <VscDebugRestart className=" w-[30px] h-[30px] text-green" />
      </button>
    );
  }

  return <></>;
};

export default LoadOrRetry;
