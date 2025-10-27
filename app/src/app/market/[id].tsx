import { CameraView, useCameraPermissions } from "expo-camera"
import { Redirect, router, useLocalSearchParams } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Alert, Modal, ScrollView, StatusBar, View } from "react-native"

import { Button } from "@/components/button"
import { Loading } from "@/components/loading"
import { Coupon } from "@/components/market/coupon"
import { Cover } from "@/components/market/cover"

import { Details, type PropsDetails } from "@/components/market/detail"
import { api } from "@/service/api"

type DataProps = PropsDetails & {
  cover: string
}

export default function Market() {
  const [data, setData] = useState<DataProps>()
  const [coupon, setCoupon] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [couponIsFetching, setCouponIsFetching] = useState(false)
  const [isVisibleCameraModal, setIsVisibleCameraModal] = useState(false)

  const [_, requestPermission] = useCameraPermissions()
  const params = useLocalSearchParams<{ id: string }>()

  const qrLock = useRef(false)

  async function fetchMarket() {
    try {
      if (!params.id) {
        throw new Error("ID não fornecido")
      }

      // Normalize and validate ID
      const marketId = String(params.id).trim()

      // common mistake: navigating to the route literally as '/market/[id]'
      if (marketId === "[id]" || marketId.includes("[")) {
        throw new Error("ID placeholder recebido (verifique a navegação)")
      }

      // Basic UUID v4 format check (server expects uuid())
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(marketId)) {
        throw new Error("ID inválido: formato UUID esperado")
      }

      console.log("Fetching market with ID:", marketId)
      const { data } = await api.get(`/markets/${marketId}`)

      if (!data) {
        throw new Error("Dados não encontrados")
      }

      console.log("Market data received:", data)
      setData(data)
      setIsLoading(false)
    } catch (error: any) {
      console.log("Error fetching market:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      })

      // Build a friendly message for the user
      let errorMessage = "Não foi possível carregar os dados"

      if (
        error?.message?.includes("placeholder") ||
        error?.message?.includes("fornecido")
      ) {
        errorMessage = "ID inválido: verifique a navegação até esta tela"
      } else if (error.response?.status === 400) {
        // Show server validation errors when available
        const serverIssues = error.response?.data?.issues
        const serverMessage = error.response?.data?.message
        if (serverIssues) {
          // Attempt to extract a human readable message
          errorMessage = serverMessage || "ID do estabelecimento inválido"
        } else {
          errorMessage = "ID do estabelecimento inválido"
        }
      } else if (error.response?.status === 404) {
        errorMessage = "Estabelecimento não encontrado"
      }

      Alert.alert("Erro", errorMessage, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    }
  }

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission()

      if (!granted) {
        return Alert.alert("Câmera", "Você precisa habilitar o uso da câmera")
      }

      qrLock.current = false
      setIsVisibleCameraModal(true)
    } catch (error) {
      console.log(error)
      Alert.alert("Câmera", "Não foi possível utilizar a câmera")
    }
  }

  async function getCoupon(id: string) {
    try {
      setCouponIsFetching(true)

      const { data } = await api.patch(`/coupons/${id}`)

      Alert.alert("Cupom", data.coupon)
      setCoupon(data.coupon)
    } catch (error) {
      console.log(error)
      Alert.alert("Erro", "Não foi possível utilizar o cupom")
    } finally {
      setCouponIsFetching(false)
    }
  }

  function handleUseCoupon(id: string) {
    setIsVisibleCameraModal(false)

    Alert.alert(
      "Cupom",
      "Não é possível reutilizar um cupom resgatado. Deseja realmente resgatar o cupom?",
      [
        { style: "cancel", text: "Não" },
        { text: "Sim", onPress: () => getCoupon(id) },
      ]
    )
  }

  useEffect(() => {
    fetchMarket()
  }, [params.id, coupon])

  if (isLoading) {
    return <Loading />
  }

  if (!data) {
    return <Redirect href="/home" />
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" hidden={isVisibleCameraModal} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Cover uri={data.cover} />
        <Details data={data} />
        {coupon && <Coupon code={coupon} />}
      </ScrollView>

      <View style={{ padding: 32 }}>
        <Button onPress={handleOpenCamera}>
          <Button.Title>Ler QR Code</Button.Title>
        </Button>
      </View>

      <Modal style={{ flex: 1 }} visible={isVisibleCameraModal}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (data && !qrLock.current) {
              qrLock.current = true
              setTimeout(() => handleUseCoupon(data), 500)
            }
          }}
        />

        <View style={{ position: "absolute", bottom: 32, left: 32, right: 32 }}>
          <Button
            onPress={() => setIsVisibleCameraModal(false)}
            isLoading={couponIsFetching}
          >
            <Button.Title>Voltar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}
