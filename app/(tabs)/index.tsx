// app/(tabs)/index.tsx
import React from "react";
import Feed from "../feed";

export default function ForYouScreen() {
  return (
    <Feed
      title="Today's Vibes"
      subtitle="Fresh content from across VibeLink."
      mode="foryou"
    />
  );
}
