import axios from "axios"
import * as Device from "expo-device"
import { Platform } from "react-native"

const ANDROID_EMULATOR = "http://10.0.2.2:3333"
const IOS_SIMULATOR = "http://localhost:3333"
const LAN = "http://seu-ip:3333" // troque pelo IP da sua máquina

const baseURL = __DEV__
  ? Platform.OS === "android"
    ? Device.isDevice
      ? LAN
      : ANDROID_EMULATOR // device físico usa LAN
    : IOS_SIMULATOR
  : "https://sua-api-em-producao.com"

export const api = axios.create({
  baseURL,
  timeout: 10000,
})
