import { useRef } from "react";
import { Text, useWindowDimensions, type ListRenderItem } from "react-native";

import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { Place, PlaceProps } from "../place";
import { s } from "./styles";

type Props = {
  data: PlaceProps[];
};

export function Places({ data }: Props) {
  const dimensions = useWindowDimensions();

  const bottomsheetRef = useRef<BottomSheet>(null);

  const renderPlace: ListRenderItem<PlaceProps> = ({ item }) => (
    <Place data={item} onPress={() => router.push(`/market/${item.id}`)} />
  );

  const snapPoints = {
    min: 278,
    max: dimensions.height - 128,
  };

  return (
    <BottomSheet
      ref={bottomsheetRef}
      snapPoints={[snapPoints.min, snapPoints.max]}
      handleIndicatorStyle={s.indicator}
      backgroundStyle={s.container}
      enableOverDrag={false}
    >
      <BottomSheetFlatList
        data={data}
        keyExtractor={(item: PlaceProps) => item.id}
        renderItem={renderPlace}
        contentContainerStyle={s.content}
        listHeaderComponent={() => (
          <Text style={s.title}>Explore locais perto de você</Text>
        )}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheet>
  );
}
