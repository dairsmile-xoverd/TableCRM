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
  useRef,
  useState,
} from 'react'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { fetchData } from '@/products'
import { toast } from 'sonner'
import { Product, FillingData } from '@/products'
import { CircleCheck, OctagonX } from 'lucide-react'
import { totalmem } from 'os'

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

const defaultProduct: Product = {
  name: '',
  type: null,
  description_short: null,
  description_long: null,
  code: null,
  unit: null,
  category: null,
  manufacturer: null,
  cashback_type: "lcard_cashback",
  tags: [],
  seo_title: null,
  seo_description: null,
  seo_keywords: []
}

type ProductModalProps = {
  handleProductAdded?: () => void
  handleProductEdit?: () => void
  product?: Product
}

export default function AddNomenclature({
  handleProductAdded,
  handleProductEdit,
  product,
}: ProductModalProps) {

  const anchor = useComboboxAnchor()
  const [currentInput, setCurrentInput] = useState<string>('')
  const [newError, setNewError] = useState({ nameError: false })
  const closeRef = useRef<HTMLButtonElement>(null)

  const [formData, setFormData] = useState<Product>(product ?? defaultProduct)

  const [fillingData, setFillingData] = useState<FillingData>({
    types: [],
    measurementUnits: [],
    categories: [],
    manufacturers: [],
    cashbackTypes: []
  })

  useEffect(() => {

    (async () => {
      try {
        const fetchProductData = await fetchData()
        setFillingData(fetchProductData)
      } catch (error) {
        console.error('Failed to load units', error)
      }
    })()

  }, [])

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

  const handleSEOKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.trim()

    if (e.key === 'Enter' && !formData.seo_keywords.includes(value)) {
      setFormData({ ...formData, seo_keywords: [...formData.seo_keywords, value] })
    } else if (formData.seo_keywords.includes(value)) {
      setFormData({
        ...formData,
        seo_keywords: formData.seo_keywords.filter((item) => item !== value),
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

  const getFilledData = (data: Product): any =>
    Object.fromEntries(
      Object.entries(data).filter(([_, value]) => (
        value !== null &&
        value !== '' &&
        value !== 0 &&
        !(Array.isArray(value) && value.length === 0))))

  const validate = (name: string): boolean => {
    const nameValidate = !name.trim();
    nameValidate && toast.error(`Поле "Имя" обязательно для ввода! Перейдите на вкладку 'Основное'.`, { position: 'top-center', icon: <OctagonX size={20} color="white" fill="red" /> })
    setNewError({ nameError: nameValidate })
    return nameValidate
  }

  const confirmHandler = async () => {
    const hasErrors = validate(formData.name);
    if (hasErrors) return

    const dataToSend = getFilledData(formData)

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
          [dataToSend],
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

      closeRef.current?.click()
    } catch (error) {
      alert(`Ошибка при добавлении номенклатуры ${error}`)
    }
  }

  const nameInputHandler = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value })
    validate(e.target.value)
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
              key={tab.value}
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
          <div className="grid grid-cols-[180px_1fr] items-start gap-x-4 gap-y-8 px-4">
            <FieldLabel htmlFor="name"
              data-after=":"
              data-before="*"
              className="font-normal text-right pt-2">
              Имя
            </FieldLabel>
            <div className='relative'>
              <Input
                required
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={nameInputHandler}
                className={`
                  ${newError.nameError ? 'border-red-500 focus-visible:border-red-500' : ''}`}
              />
              {newError.nameError && (
                <p className="absolute text-red-500 text-sm mt-1">
                  Поле "Имя" обязательно для заполнения
                </p>
              )}
            </div>


            <FieldLabel htmlFor="type" data-after=":" className="font-normal text-right pt-2">
              Тип
            </FieldLabel>
            <Combobox
              id="type"
              name="type"
              items={fillingData.types}
              value={
                fillingData.types.find((item) => item.value === formData.type)?.label ?? ''
              }
              onValueChange={(selectedValue) => {
                const selectedType = fillingData.types.find(
                  (item) => item.label === selectedValue,
                )
                if (selectedType?.value) {
                  setFormData({ ...formData, type: selectedType.value })
                }
              }}
            >
              <ComboboxInput
                readOnly
                placeholder="Выберите тип..."
                style={{ cursor: 'pointer' }}
              />

              <ComboboxContent className="pointer-events-auto transition-all duration-300">
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

            <FieldLabel htmlFor="tags" data-after=":" className="font-normal text-right pt-2">
              Тэги
            </FieldLabel>
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
                          onClickCapture={(e) => setFormData({
                            ...formData,
                            tags: formData.tags.filter((item) => item !== e.currentTarget.textContent),
                          })}
                        >
                          {value}
                        </ComboboxChip>
                      ))}

                      <ComboboxChipsInput onKeyDown={handleTagKeyDown} />
                    </React.Fragment>
                  )}
                </ComboboxValue>
              </ComboboxChips>

              {currentInput.trim() ? (
                <ComboboxContent
                  anchor={anchor}
                  style={{ pointerEvents: 'auto' }}
                  className="transition-all duration-300"
                >
                  <ComboboxList>
                    <ComboboxItem key={currentInput} value={currentInput}>
                      {currentInput}
                    </ComboboxItem>
                  </ComboboxList>
                </ComboboxContent>
              ) : (
                <ComboboxContent
                  anchor={anchor}
                  style={{ pointerEvents: 'auto' }}
                  className="transition-all duration-300"
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

            <FieldLabel htmlFor="description_short" data-after=":" className="font-normal text-right pt-2">
              Краткое описание
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

            <FieldLabel htmlFor="description_long" data-after=":" className="font-normal w-38">
              Длинное описание
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

            <FieldLabel htmlFor="code" data-after=":" className="font-normal text-right pt-2">
              Код
            </FieldLabel>
            <Input
              type='text'
              id="code"
              name='code'
              value={formData.code ?? ''}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value })
              }}
            ></Input>

            <FieldLabel htmlFor="unit_name" data-after=":" className="font-normal text-right pt-2">
              Единица измерения
            </FieldLabel>
              <Combobox
                id="unit_name"
                name="unit_name"
                items={fillingData.measurementUnits}
                value={
                  fillingData.measurementUnits.find(
                    (item) => item.id === formData.unit,
                  )?.name ?? ''
                }
                onValueChange={(selectedValue) => {
                  setFormData({ ...formData, unit: selectedValue, })
                }}
              >
                <ComboboxInput />
                <ComboboxContent className="pointer-events-auto transition-all duration-300">
                  <ComboboxEmpty>Нет данных</ComboboxEmpty>
                  <ComboboxList className="max-h-60" onWheel={(e) => e.stopPropagation()}>
                    {(item) => (
                      <ComboboxItem
                        key={item.id}
                        value={item.id}
                        className="cursor-pointer"
                      >
                        {item.name}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

            <FieldLabel htmlFor="category" data-after=":" className="font-normal text-right pt-2">
              Категория
            </FieldLabel>
              <Combobox
                id="category"
                name="category"
                items={fillingData.categories}
                value={
                  fillingData.categories.find(
                    (item) => item.id === formData.category,
                  )?.name ?? ''
                }
                onValueChange={(selectedValue) => {
                  setFormData({ ...formData, category: selectedValue })
                }}
              >
                <ComboboxInput />

                <ComboboxContent className="pointer-events-auto transition-all duration-300">
                  <ComboboxEmpty>Нет данных</ComboboxEmpty>
                  <ComboboxList className="max-h-60" onWheel={(e) => e.stopPropagation()}>
                    {(item) => (
                      <ComboboxItem
                        key={item.id}
                        value={item.id}
                        className="cursor-pointer"
                      >
                        {item.name}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>


            <FieldLabel htmlFor="manufacturer" data-after=":" className="font-normal text-right pt-2">
              Производитель
            </FieldLabel>
            <Combobox
              id="manufacturer"
              name="manufacturer"
              items={fillingData.manufacturers}
              value={
                fillingData.manufacturers.find(
                  (item) => item.id === formData.manufacturer,
                )?.name ?? ''
              }
              onValueChange={(selectedValue) => {
                setFormData({ ...formData, manufacturer: selectedValue })
              }}
            >
              <ComboboxInput />

              <ComboboxContent className="pointer-events-auto transition-all duration-300">
                <ComboboxEmpty>Нет данных</ComboboxEmpty>
                <ComboboxList className="max-h-60" onWheel={(e) => e.stopPropagation()}>
                  {(item) => (
                    <ComboboxItem
                      key={item.id}
                      value={item.id}
                      className="cursor-pointer"
                    >
                      {item.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

            <FieldLabel htmlFor="cashback_type" data-after=":" className="font-normal text-right pt-2">
              Тип кешбека
            </FieldLabel>
            <Combobox
              id="cashback_type"
              name="cashback_type"
              items={fillingData.cashbackTypes}
              value={
                fillingData.cashbackTypes.find(
                  (item) => item.value === formData.cashback_type,
                )?.label ?? ''
              }
              defaultValue={formData.cashback_type}
              onValueChange={(selectedValue) => {
                setFormData({ ...formData, cashback_type: selectedValue })
              }}
            >
              <ComboboxInput />

              <ComboboxContent className="pointer-events-auto transition-all duration-300">
                <ComboboxEmpty>Нет данных</ComboboxEmpty>
                <ComboboxList className="max-h-60" onWheel={(e) => e.stopPropagation()}>
                  {(item) => (
                    <ComboboxItem
                      key={item.id}
                      value={item.value}
                      className="cursor-pointer"
                    >
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

          </div>
        </TabsContent>

        <TabsContent value="SEO">
          <FieldGroup className="px-10">

            <Field orientation='horizontal'>

              <FieldLabel htmlFor='seo_title' data-after=":" className='font-normal min-w-[60px]'>SEO Title</FieldLabel>

              <Input
                id='seo_title'
                name='seo_title'
                type='text'
                placeholder='Заголовок для поисковиков'
                value={formData.seo_title ?? ''}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
              >
              </Input>

            </Field>

            <Field orientation='horizontal'>

              <FieldLabel htmlFor='seo_description' data-after=":" className='font-normal min-w-[110px]'>SEO Description</FieldLabel>

              <Textarea
                id='seo_description'
                name='seo_description'
                placeholder='Краткое описание для поисковиков'
                value={formData.seo_description ?? ''}
                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
              >
              </Textarea>

            </Field>

            <Field orientation='horizontal'>

              <FieldLabel htmlFor='seo_title' data-after=":" className='font-normal min-w-[110px]' >SEO Keywords</FieldLabel>

              <div className="w-full">
                <Combobox
                  id="seo_title"
                  name="seo_title"
                  multiple
                  autoHighlight
                  items={formData.seo_keywords}
                  value={formData.seo_keywords}
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
                              onClickCapture={(e) => setFormData({
                                ...formData,
                                seo_keywords: formData.seo_keywords.filter((item) => item !== e.currentTarget.textContent),
                              })}
                            >
                              {value}
                            </ComboboxChip>
                          ))}

                          <ComboboxChipsInput onKeyDown={handleSEOKeyDown} />
                        </React.Fragment>
                      )}
                    </ComboboxValue>
                  </ComboboxChips>

                  {currentInput.trim() ? (
                    <ComboboxContent
                      anchor={anchor}
                      style={{ pointerEvents: 'auto' }}
                      className="transition-all duration-300"
                    >
                      <ComboboxList>
                        <ComboboxItem key={currentInput} value={currentInput}>
                          {currentInput}
                        </ComboboxItem>
                      </ComboboxList>
                    </ComboboxContent>
                  ) : (
                    <ComboboxContent
                      anchor={anchor}
                      style={{ pointerEvents: 'auto' }}
                      className="transition-all duration-300"
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



          </FieldGroup>


        </TabsContent>

        <TabsContent value='fast'

        > <FieldGroup className='px-10'>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="global_category_id"
                className="w-[190px] font-normal"
                data-after=":">
                Глобальная категория
              </FieldLabel>

              <Input id="global_category_id">
              </Input>
            </Field>
          </FieldGroup></TabsContent>


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

        <DialogClose ref={closeRef} />

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

      </DialogFooter>
    </div >
  )
}
