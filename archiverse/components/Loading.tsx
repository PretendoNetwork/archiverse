import React, { useEffect, useState } from 'react';

const frames = [
  [
    [true, true, true],
    [true, true, false],
    [true, false, false],
  ],
  [
    [true, true, true],
    [true, true, true],
    [false, false, false],
  ],
  [
    [true, true, true],
    [false, true, true],
    [false, false, true],
  ],
  [
    [false, true, true],
    [false, true, true],
    [false, true, true],
  ],
  [
    [false, false, true],
    [false, true, true],
    [true, true, true],
  ],
  [
    [false, false, false],
    [true, true, true],
    [true, true, true],
  ],
  [
    [true, false, false],
    [true, true, false],
    [true, true, true],
  ],
  [
    [true, true, false],
    [true, true, false],
    [true, true, false],
  ],
];

const LoadingIcon = () => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prevFrameIndex) => (prevFrameIndex + 1) % frames.length);
    }, 70);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-block">
      {frames[frameIndex].map((row, rowIndex) => (
        <div key={rowIndex + " loading icon row"} className="flex">
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex + " loading icon column"}
              className={`w-[6px] h-[6px] m-[1px] ${cell ? 'bg-green' : 'bg-gray'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingIcon;