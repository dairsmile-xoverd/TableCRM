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
import { Field, FieldGroup } from '@/components/ui/field'
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
import { CircleCheck, CircleQuestionMark, File, OctagonX, Percent, RussianRuble } from 'lucide-react'
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
    <div className="flex flex-col gap-5 p-2 ">
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
          <div className="grid grid-cols-[210px_1fr] items-start gap-x-2 gap-y-8 pr-18">
            <label htmlFor="name"
              data-after=":"
              data-before="*"
              className="text-right">
              Имя
            </label>
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


            <label htmlFor="type" data-after=":" className="text-right pt-1">
              Тип
            </label>
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

            <label htmlFor="tags" data-after=":" className="font-normal text-right pt-1">
              Тэги
            </label>
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

            <label htmlFor="description_short" data-after=":" className="font-normal text-right pt-1">
              Краткое описание
            </label>
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

            <label htmlFor="description_long" data-after=":" className="font-normal text-right pt-1">
              Длинное описание
            </label>
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

            <label htmlFor="code" data-after=":" className="font-normal text-right pt-1">
              Код
            </label>
            <Input
              type='text'
              id="code"
              name='code'
              value={formData.code ?? ''}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value })
              }}
            ></Input>

            <label htmlFor="unit_name" data-after=":" className="font-normal text-right pt-1">
              Единица измерения
            </label>
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

            <label htmlFor="category" data-after=":" className="font-normal text-right pt-1">
              Категория
            </label>
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


            <label htmlFor="manufacturer" data-after=":" className="font-normal text-right pt-1">
              Производитель
            </label>
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

            <label htmlFor="cashback_type" data-after=":" className="font-normal text-right pt-1">
              Тип кешбека
            </label>
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
                      key={item.value}
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
          <FieldGroup className="grid grid-cols-[210px_1fr] items-start gap-x-2 gap-y-8 pr-18">

            <label htmlFor='seo_title' data-after=":" className='text-right pt-1'>SEO Title</label>
            <Input
              id='seo_title'
              name='seo_title'
              type='text'
              placeholder='Заголовок для поисковиков'
              value={formData.seo_title ?? ''}
              onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
            >
            </Input>

            <label htmlFor='seo_description' data-after=":" className='text-right pt-1'>SEO Description</label>
            <Textarea
              id='seo_description'
              name='seo_description'
              placeholder='Краткое описание для поисковиков'
              value={formData.seo_description ?? ''}
              onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}>
            </Textarea>

            <label htmlFor='seo_title' data-after=":" className='text-right pt-1' >SEO Keywords</label>
            <Combobox
              id="seo_title"
              name="seo_title"
              multiple
              autoHighlight
              items={formData.seo_keywords}
              value={formData.seo_keywords}
              onInputValueChange={(value) => {
                setCurrentInput(value)
              }}>
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

                      <ComboboxChipsInput onKeyDown={handleSEOKeyDown} placeholder='Ключевые слова' />
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
          </FieldGroup>
        </TabsContent>

        <TabsContent value='fast'>
          <div className="grid grid-cols-[210px_1fr] items-start gap-x-2 gap-y-8 pr-18">

            <label htmlFor="global_category_id"
              data-after=":"
              className="text-right pt-1">
              Глобальная категория
            </label>
            <Input id="global_category_id" placeholder='Выберите глобальную категорию' />

            <label htmlFor="marketplace_price"
              data-after=":"
              className="text-right pt-1 flex justify-end gap-1">
              Цена для маркетплейса
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleQuestionMark size={18} className="cursor-help mt-1" color='gray' />
                </TooltipTrigger>
                <TooltipContent>
                  <span>При выборе адреса широта и долгота заполняются автоматически</span>
                </TooltipContent>
              </Tooltip>
            </label>
            <div>
              <Input id="marketplace_price" type='number' step="0.01" placeholder='0:00' className='rounded-r-none' />
              <span className='absolute h-9 bg-accent p-[11px] rounded-r-md border-gray-200 border border-l-0' >
                <RussianRuble size={13} />
              </span>
            </div>

            <label htmlFor="chatting_percent"
              data-after=":"
              className="text-right pt-1 flex justify-end gap-1">
              Комиссия маркета
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleQuestionMark size={18} className="cursor-help mt-1" color='gray' />
                </TooltipTrigger>
                <TooltipContent>
                  <span>При выборе адреса широта и долгота заполняются автоматически</span>
                </TooltipContent>
              </Tooltip>
            </label>
            <div>
              <Input id="chatting_percent" placeholder='4–100' className='rounded-r-none' />
              <span className='absolute h-9 bg-accent p-[11px] rounded-r-md border-gray-200 border border-l-0' >
                <Percent size={13} />
              </span>
              <p className='font-light text-[13px] pt-1'>
                Минимум 4%. Значение приводится к ближайшему кратному 4% (4–100)
              </p>
            </div>
           
            <label htmlFor="qr_hash"
              data-after=":"
              className="text-right pt-1 flex justify-end gap-1">
              QR-hash
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleQuestionMark size={18} className="cursor-help mt-1" color='gray' />
                </TooltipTrigger>
                <TooltipContent>
                  <span>При выборе адреса широта и долгота заполняются автоматически</span>
                </TooltipContent>
              </Tooltip>
            </label>
            <div>
              <Input readOnly id="qr_hash" placeholder='Автоматически генерируется при сохранении'
                className='cursor-not-allowed bg-accent focus-visible:border-gray-200 hover:border-border-gray-200 rounded-r-none' />
              <span className='absolute cursor-not-allowed h-9 px-5 bg-accent p-[11px] rounded-r-md border-gray-200 border border-l-0 ' >
                <File size={13} color='gray' />
              </span>
            </div>

            <label htmlFor="address"
              data-after=":"
              className="text-right pt-1 flex justify-end gap-1">
              Адрес
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleQuestionMark size={18} className="cursor-help mt-1" color='gray' />
                </TooltipTrigger>
                <TooltipContent>
                  <span>При выборе адреса широта и долгота заполняются автоматически</span>
                </TooltipContent>
              </Tooltip>
            </label>
            <Input id="address" placeholder='Введите адрес' />

            <div className='grid grid-cols-[80px_1fr_80px_1fr] gap-4 px-8 '>

              <label
                htmlFor="latitude"
                data-after=":"
                className="flex gap-1 text-right pt-1">
                Широта
                <Tooltip>
                  <span className='cursor-help pt-1' >
                    <TooltipTrigger asChild>
                      <CircleQuestionMark size={18} color='gray' />
                    </TooltipTrigger>
                  </span>
                  <TooltipContent>
                    <span>Автоматически заполняется при выборе адреса</span>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Input
                readOnly
                id="latitude"
                placeholder="55.751244"
                className='cursor-not-allowed w-80 bg-accent focus-visible:border-gray-200 hover:border-border-gray-200' />

              <label
                htmlFor="longitude"
                data-after=":"
                className="flex gap-1 text-right pt-1">
                Долгота
                <Tooltip>
                  <span className='cursor-help pt-1'>
                    <TooltipTrigger asChild>
                      <CircleQuestionMark size={18} color='gray' />
                    </TooltipTrigger>
                  </span>
                  <TooltipContent>
                    <span>Автоматически заполняется при выборе адреса</span>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Input
                readOnly
                id="longitude"
                placeholder="37.618423"
                className='cursor-not-allowed w-80 bg-accent focus-visible:border-gray-200 hover:border-border-gray-200' />
            </div>
          </div>

        </TabsContent>

      </Tabs >

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
