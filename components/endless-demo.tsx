"use client";

import Endless from "@/components/ui/endless";

export default function EndlessSplashDemo() {
  return (
    <Endless
      brandName="NOVA MART"
      tagline="Ideas that move brands forward · Shop The Future"
      onEnter={() => {
        window.location.href = "/products/";
      }}
    />
  );
}
