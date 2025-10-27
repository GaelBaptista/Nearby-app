import { Image, Text, View } from "react-native";

import { s } from "./styles";

export function Welcome() {
  return (
    <View>
      <Image source={require("@/assets/logo.png")} />
      <Text style={s.title}>Boas Vindas ao Nearby!</Text>
      <Text style={s.subtitle}>
        {/* {"\n"}  quebra de linga */}
        Tenha cupons de vantagem para usar em {"\n"} //quebra de linga seus
        estabelicimentos favoritos.
      </Text>
    </View>
  );
}
