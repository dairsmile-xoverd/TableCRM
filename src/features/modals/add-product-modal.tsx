'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import React, {
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import types from '@/products'
import { toast } from 'sonner'
import { Product } from '@/types'
import { CircleCheck } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN

const tabs = [
  {
    label: 'Основное',
    value: 'basic',
  },
  {
    label: 'SEO',
    value: 'SEO',
  },
  {
    label: 'Быстро',
    value: 'fast',
  },
  {
    label: 'Цены',
    value: 'prices',
  },
  {
    label: 'Видео',
    value: 'video',
  },
]

export type ProductFormData = {
  name: string
  type: string | null
  tags: string[]
  description_short: string | null
  description_long: string | null
}

type AddProductModalProps = {
  handleProductAdded?: () => void
  handleProductEdit?: () => void
  product?: Product
}

export default function AddProductModal({
  handleProductAdded,
  handleProductEdit,
  product,
}: AddProductModalProps) {
  const anchor = useComboboxAnchor()
  const [currentInput, setCurrentInput] = useState<string>('')

  const [formData, setFormData] = useState<Product>(
    product ?? {
      name: '',
      type: null,
      tags: [],
      description_short: null,
      description_long: null,
    },
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.trim()

    if (e.key === 'Enter' && !formData.tags.includes(value)) {
      if (value.length < 2 || value.length > 20) {
        toast.warning('Длина тега должна быть от 2 до 20 символов', {
          position: 'top-center',
        })
        return
      }
      setFormData({ ...formData, tags: [...formData.tags, value] })
    } else if (formData.tags.includes(value)) {
      setFormData({
        ...formData,
        tags: formData.tags.filter((item) => item !== value),
      })
    }
  }

  const handleClickCapture = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const value = e.currentTarget.textContent
    setFormData({
      ...formData,
      tags: formData.tags.filter((item) => item !== value),
    })
  }

  const confirmHandler = async () => {
    try {
      if (product?.id) {
        const resolve = await axios.patch(
          `${API_URL}/nomenclature/${product.id}/`,
          formData,
          {
            params: {
              token: API_TOKEN,
            },
          },
        )

        toast.success('Номенклатура изменена', {
          position: 'top-center',
          icon: <CircleCheck size={20} color="white" fill="#52c41a" />,
        })
        handleProductEdit?.()
      } else {
        const resolve = await axios.post(
          `${API_URL}/nomenclature/`,
          [formData],
          {
            params: {
              token: API_TOKEN,
            },
          },
        )
        toast.success('Номенклатура добавлена', {
          position: 'top-center',
          icon: <CircleCheck size={20} color="white" fill="#52c41a" />,
        })
        handleProductAdded?.()
      }
    } catch (error) {
      alert(`Ошибка при добавлении номенклатуры ${error}`)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>Добавить номенклатуру</DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="basic" className="flex gap-5">
        <TabsList variant="line" className="active:text-blue-700">
          {tabs.map((tab) => (
            <TabsTrigger
              value={tab.value}
              className="
              font-normal
              text-[15px]
              data-[state=active]:text-[17px]
              hover:text-blue-500 
              data-[state=hover]:text-blue-500
               data-[state=active]:text-blue-500
               
               data-[state=active]:after:bg-blue-500
               
              cursor-pointer"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic">
          <FieldGroup className="px-38">
            <Field orientation="horizontal">
              <FieldLabel htmlFor="name" className="font-normal">
                Имя:
              </FieldLabel>
              <Input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                }}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="type" className="font-normal ">
                Тип:
              </FieldLabel>
              <div className="w-full">
                <Combobox
                  id="type"
                  name="type"
                  items={types}
                  value={
                    types.find((item) => item.value === formData.type)?.label ??
                    ''
                  }
                  onValueChange={(selectedValue) => {
                    const typeOptions = types.find(
                      (item) => item.label === selectedValue,
                    )
                    if (typeOptions?.value) {
                      setFormData({ ...formData, type: typeOptions.value })
                    }
                  }}
                >
                  <ComboboxInput
                    readOnly
                    placeholder="Выберите тип..."
                    style={{ cursor: 'pointer' }}
                  />

                  <ComboboxContent style={{ pointerEvents: 'auto' }}>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem
                          key={item.value}
                          value={item.label}
                          className="cursor-pointer"
                        >
                          {item.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="tags" className="font-normal">
                Тэги:
              </FieldLabel>
              <div className="w-full">
                <Combobox
                  id="tags"
                  name="tags"
                  multiple
                  autoHighlight
                  items={formData.tags}
                  value={formData.tags}
                  onInputValueChange={(value) => {
                    setCurrentInput(value)
                  }}
                >
                  <ComboboxChips ref={anchor}>
                    <ComboboxValue>
                      {(values) => (
                        <React.Fragment>
                          {values.map((value: string) => (
                            <ComboboxChip
                              key={value}
                              onClickCapture={handleClickCapture}
                            >
                              {value}
                            </ComboboxChip>
                          ))}

                          <ComboboxChipsInput onKeyDown={handleKeyDown} />
                        </React.Fragment>
                      )}
                    </ComboboxValue>
                  </ComboboxChips>

                  {currentInput.trim() ? (
                    <ComboboxContent
                      anchor={anchor}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <ComboboxList>
                        <ComboboxItem value={currentInput}>
                          {currentInput}
                        </ComboboxItem>
                      </ComboboxList>
                    </ComboboxContent>
                  ) : (
                    <ComboboxContent
                      anchor={anchor}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <ComboboxEmpty>Нет данных</ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item} value={item}>
                            {item}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  )}
                </Combobox>
              </div>
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="description_short" className="font-normal ">
                Краткое описание:
              </FieldLabel>
              <Textarea
                id="description_short"
                name="description_short"
                value={formData.description_short ?? ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    description_short: e.target.value,
                  })
                }}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="description_long" className="font-normal">
                Длинное описание:
              </FieldLabel>
              <Textarea
                id="description_long"
                name="description_long"
                value={formData.description_long ?? ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    description_long: e.target.value,
                  })
                }}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="code" className="font-normal">
                Код
              </FieldLabel>
              <Input id="code"></Input>
            </Field>
          </FieldGroup>
        </TabsContent>
      </Tabs>

      <DialogFooter className="sm:justify-end">
        <DialogClose asChild>
          <Button
            variant="outline"
            type="button"
            className="
              mt-5 
              text-black rounded 
              hover:text-blue-400 
              hover:bg-amber-50/0 
              hover:border-blue-400 
              active:border-blue-600
              active:text-blue-600
              cursor-pointer"
          >
            Отменить
          </Button>
        </DialogClose>
        {
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-blue-500 mt-5 
                text-white 
                rounded 
                hover:bg-blue-400 
                active:bg-blue-600
                cursor-pointer"
              onClick={() => confirmHandler()}
            >
              Подтвердить
            </Button>
          </DialogClose>
        }
      </DialogFooter>
    </div>
  )
}
