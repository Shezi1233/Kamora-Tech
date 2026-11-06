"use client";

import { useRef, useState } from "react";

export function ServiceSlider({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  function scrollBy(direction: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(track.clientWidth * 0.8, 260), behavior: "smooth" });
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setProgress(max <= 0 ? 100 : (track.scrollLeft / max) * 100);
  }

  return (
    <div>
      <div className="d-flex justify-content-end gap-2 mb-2">
        <button
          type="button"
          className="btn btn-outline-light slider-btn"
          onClick={() => scrollBy(-1)}
          aria-label="Previous services"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-outline-light slider-btn"
          onClick={() => scrollBy(1)}
          aria-label="Next services"
        >
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
      <div className="service-slider" ref={trackRef} onScroll={onScroll}>
        {children}
      </div>
      <div className="slider-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
