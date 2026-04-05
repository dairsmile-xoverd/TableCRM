import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN

type TypeOption = {
  label: string
  value: string
}

export type Picture = {
  created_at: number
  entity: string
  entity_id: number
  id: number
  is_main: boolean
  public_url: string
  size: number
  updated_at: number
  url: string
}

export type Product = {
  name: string
  type: string | null
  description_short: string | null
  description_long: string | null
  code: string | null
  unit: number | null
  category: number | null
  manufacturer: string | null,
  cashback_type: string | null
  tags: string[]
  seo_title: string | null,
  seo_description: string | null,
  seo_keywords: string[]
  id?: number | null
}

export type FillingData = {
  types: TypeOption[]
  measurementUnits: any[]
  categories: any[]
  manufacturers: any[],
  cashbackTypes: TypeOption[]
}

export const types: TypeOption[] = [
  { label: 'Товар', value: 'product' },
  { label: 'Услуга', value: 'service' },
  { label: 'Предложение', value: 'offer' },
  { label: 'Ресурс', value: 'resource' },
  { label: 'Аренда', value: 'rental' },
  { label: 'Недвижимость', value: 'property' },
  { label: 'Работа', value: 'work' },
]

export const cashbackTypes: TypeOption[] = [
  { label: 'Процент', value: 'precent' },
  { label: 'Постоянный', value: 'const' },
  { label: 'По карте лояльности', value: 'lcard_cashback' },
  { label: 'Отсутствует', value: 'no_cashback' },
]

export const fetchData = async () => {

  const resMeasurementUnits = await axios.get(`${API_URL}/units/`, {
    params: {
      token: API_TOKEN
    }
  })

  const resCategories = await axios.get(`${API_URL}/categories/`, {
    params: {
      token: API_TOKEN
    }
  })

  const resManufacturers = await axios.get(`${API_URL}/manufacturers/`, {
    params: {
      token: API_TOKEN
    }
  })

  const measurementUnits = resMeasurementUnits.data.result
  const categories = resCategories.data.result
  const manufacturers = resManufacturers.data.result

  const result = {
    types: types,
    measurementUnits: Array.isArray(measurementUnits) ? measurementUnits : [],
    categories: Array.isArray(categories) ? categories : [],
    manufacturers: Array.isArray(manufacturers) ? manufacturers : [],
    cashbackTypes: cashbackTypes
  }

  return result
}