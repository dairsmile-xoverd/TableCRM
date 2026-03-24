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
  id?: number
  type: string | null
  name: string
  action?: () => void
  tags: string[]
  description_short: string | null
  description_long: string | null
}
