import { Categories, CategoriesProps } from "@/components/categories"
import type { PlaceProps } from "@/components/place"
import { Places } from "@/components/places"
import { api } from "@/service/api"
import { colors } from "@/styles/colors"
import { fontFamily } from "@/styles/font-family"
import * as Location from "expo-location"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, Text, View } from "react-native"
import MapView, { Callout, Marker } from "react-native-maps"
const locationPng: any = require("../assets/location.png")
const pinPng: any = require("../assets/pin.png")

type MarketProps = PlaceProps & {
  latitude: number
  longitude: number
}

const currentLocation = {
  latitude: -23.561187293883442,
  longitude: -46.65606970948792,
}

export default function Home() {
  const [categories, setCategories] = useState<CategoriesProps>([])
  const [categorySelected, setCategorySelected] = useState("")
  const [markets, setMarkets] = useState<MarketProps[]>([])

  async function fetchCategories() {
    try {
      const { data } = await api.get("/categories")
      setCategories(data)
      setCategorySelected(data[0].id)
    } catch (error) {
      console.error("Error fetching categories:", error)
      Alert.alert("Categorias", " Erro ao carregar categorias.")
    }
  }

  async function fetchMarkets() {
    try {
      if (!categorySelected) {
        return
      }

      const { data } = await api.get(
        `/markets/category/${encodeURIComponent(categorySelected)}`
      )

      setMarkets(data)
    } catch (error) {
      console.log(error)
      Alert.alert("Locais", " Erro ao carregar mercados.")
    }
  }

  async function getLocation() {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync()
      if (granted) {
        const location = await Location.getCurrentPositionAsync()
        console.log(location)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    //  getLocation()
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchMarkets()
  }, [categorySelected])

  return (
    <View style={{ flex: 1 }}>
      <Categories
        data={categories}
        onSelected={setCategorySelected}
        selected={categorySelected}
      />

      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          identifier="current"
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          image={locationPng}
        />
        {markets.map(item => (
          <Marker
            key={item.id}
            identifier={item.id}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            image={pinPng}
          >
            <Callout onPress={() => router.push(`/market/${item.id}`)}>
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.gray[600],
                    fontFamily: fontFamily.medium,
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.gray[600],
                    fontFamily: fontFamily.regular,
                  }}
                >
                  {item.address}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <Places data={markets} />
    </View>
  )
}
