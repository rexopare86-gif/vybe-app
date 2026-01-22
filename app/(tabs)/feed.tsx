import React from "react";
import { View } from "react-native";
import { VybeButton } from "../../components/ui/VybeButton";
import { VybeCard } from "../../components/ui/VybeCard";
import { VybeScreen } from "../../components/ui/VybeScreen";
import { VybeText } from "../../components/ui/VybeText";

export default function FeedScreen() {
  return (
    <VybeScreen>
      <View style={{ padding: 16 }}>
        <VybeText variant="title">🔥 Welcome to Vybe</VybeText>

        <VybeCard>
          <VybeText>This is your first Vybe card.</VybeText>
          <VybeButton title="Explore Vybe" onPress={() => {}} />
        </VybeCard>
      </View>
    </VybeScreen>
  );
}
