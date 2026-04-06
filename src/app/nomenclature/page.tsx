'use client'
import { Button } from '@/components/ui/button'
import AddNomenclature from '@/features/Modal/ui/AddNomenclature'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  MoreHorizontalIcon,
  OctagonX,
  PenLine,
  Plus,
  Trash,
} from 'lucide-react'
import axios from 'axios'
import { types } from '@/products'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Picture, Product } from '@/products'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import Image from 'next/image'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Input } from '@/components/ui/input'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN

const ITEMS_PER_PAGE = 10

export default function Nomenclature() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPage, setTotalPage] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [pictures, setPictures] = useState<{ [key: number]: Picture[] }>({})

  const totalPages = Math.ceil(totalPage / ITEMS_PER_PAGE)

  // Функция для загрузки номенклатуры
  const fetchProducts = async (page: number) => {
    const offset = (page - 1) * ITEMS_PER_PAGE

    try {
      const response = await axios.get(`${API_URL}/nomenclature/`, {
        params: {
          token: API_TOKEN,
          offset,
          limit: ITEMS_PER_PAGE,
        },
      })

      setProducts(response.data.result)
      setTotalPage(response.data.count)
      setCurrentPage(page)
      fetchPicture(response.data.result)
    } catch (error) {
      toast.error('Ошибка загрузки товаров', { position: 'top-center' })
    }
  }

  const fetchPicture = (product: Product[] | Product) => {
    const products = Array.isArray(product) ? product : [product]

    products.forEach((singleProduct) => {
      axios
        .get(`${API_URL}/pictures/`, {
          params: {
            entity: 'nomenclature',
            entity_id: singleProduct.id,
            token: API_TOKEN,
          },
        })
        .then((response) => {
          setPictures((prev) => ({
            ...prev,
            [singleProduct.id!]: response.data.result,
          }))
        })
        .catch((error) => {
          toast.error(
            `Не удалось загрузить фото для номенклатуры ${singleProduct.name} ${error}`,
          )
        })
    })
  }

  useEffect(() => {
    fetchProducts(currentPage)
  }, [currentPage])

  // Обработчик добавления номенклатуры
  const handleProductAdded = () => {
    fetchProducts(1)
  }

  // Обработчик редактирования номенклатуры
  const handleProductEdit = () => {
    fetchProducts(currentPage)
  }

  // Обработчик удаления номенклатуры
  const handleProductDelete = async (product: Product) => {
    try {
      const response = await axios.delete(
        `${API_URL}/nomenclature/${product.id}/`,
        {
          params: {
            token: API_TOKEN,
          },
        },
      )
      toast.success('Номенклатура удалена', {
        position: 'top-center',
        icon: <CircleCheck size={20} color="white" fill="#52c41a" />,
      })

      handleProductEdit()
    } catch (error) {
      toast.error('Ошибка удаления номенклатуры', {
        position: 'top-center',
        icon: <OctagonX size={20} color="white" fill="red" />,
      })
    }
  }

  // Добавление фото номенклатуры

  // Обработчик нажатия на кнопу выбора фото
  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Обработчик измения файла
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    product: Product,
  ) => {
    const file = event.target.files?.[0]

    if (file) {
      uploadImage(file, product)
    }
  }

  // Загрузка фото
  const uploadImage = (file: File, product: Product) => {
    const formData = new FormData()
    formData.append('file', file)

    axios
      .post(`${API_URL}/pictures/`, formData, {
        params: {
          entity: 'nomenclature',
          entity_id: product.id,
          token: API_TOKEN,
        },
      })
      .then(() => fetchPicture(product))
  }

  // Добавление фото номенклатуры

  const handlePictureDelete = (picture: Picture, product: Product) => {
    axios
      .delete(`${API_URL}/pictures/${picture.id}/`, {
        params: {
          token: API_TOKEN,
        },
      })
      .then(() => fetchPicture(product))
  }
  
  return (
    <div className="relative gap-7 flex-col p-5" >
      <Dialog >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="
            cursor-pointer  
            w-51 
          bg-blue-500
          text-white rounded-1 
          hover:bg-blue-400 
          hover:text-white
          active:bg-blue-600"
          >
            <Plus /> <span>Добавить номенклатуру</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-1xl md:max-w-2xl lg:max-w-7xl">
          <AddNomenclature handleProductAdded={handleProductAdded} />
        </DialogContent>
      </Dialog>

      {/* Таблица  */}
      <div className="bg-white my-4">
        <>
          <Table>
            <TableHeader>
              <TableRow className="border bg-blue-50 hover:bg-blue-50 ">
                <TableHead className="border-r text-center w-0 min-w-0 py-7 px-3">
                  Изображение
                </TableHead>
                <TableHead className="border-r text-center">Тип</TableHead>
                <TableHead className="border-r text-center">Имя</TableHead>
                <TableHead className="border-r text-center">Описание</TableHead>
                <TableHead className="text-center w-0">Действие</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="border">
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="border-r text-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          onClick={() => fetchPicture(product)}
                          className="
                              relative
                              cursor-pointer
                              text-gray-400
                              border-dashed
                              border 
                              rounded
                              bg-gray-100
                              hover:bg-blue-100
                              hover:border-blue-400
                              w-10
                              h-10
                              shrink-0
                              overflow-hidden
                              p-0
                              "
                        >
                          {product.id && pictures[product.id]?.[0] ? (
                            <div className="w-full h-full">
                              <Image
                                src={pictures[product.id][0].public_url}
                                alt={'Product image'}
                                fill
                                className="object-cover"
                              />
                              {/* Бейдж с количеством, если картинок больше 1 */}
                              {pictures[product.id].length > 1 && (
                                <span
                                  className="
                               absolute 
                               top-[-3px]
                               right-[-3px]
                               text-white 
                               text-[10px] 
                               font-bold
                               min-w-4 
                               h-4 
                               flex 
                               items-center 
                               justify-center 
                               rounded-full 
                               bg-[rgb(255,77,79)]"
                                >
                                  {pictures[product.id].length}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Plus />
                          )}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent
                        side="bottom"
                        className="
                          border-0 
                          shadow-[0_0_10px_rgba(0,0,0,0.2)]
                          p-3
                          -left-6  
                          top-2"
                      >
                        <PopoverPrimitive.Arrow
                          className="
                          fill-white stroke-gray-200 stroke-0 drop-shadow-md"
                          width={16}
                          height={8}
                        />
                        <div
                          className={`grid ${product.id && pictures[product.id]?.length > 4 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 pb-3`}
                        >
                          {product.id &&
                            pictures[product.id] &&
                            pictures[product.id].map((picture) => (
                              <div
                                key={picture.id}
                                className="relative aspect-square"
                              >
                                <Image
                                  ref={imageRef}
                                  src={picture.public_url}
                                  alt=""
                                  width={800}
                                  height={800}
                                  quality={100}
                                  className="
                                  absolute
                                  cursor-pointer
                                  rounded
                                  object-cover 
                                  w-full  
                                  h-full"
                                />

                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Trash
                                      className="
                                        cursor-pointer
                                        absolute 
                                        top-0.5
                                        right-0.5 
                                        bg-amber-50
                                        rounded-[4px]
                                        text-red-500
                                        hover:text-red-400
                                        p-[4px]"
                                      size={22}
                                    />
                                  </PopoverTrigger>

                                  <PopoverContent
                                    side="top"
                                    className="
                                        w-61
                                        p-3
                                      bg-white
                                        border-0
                                        shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                                  >
                                    <PopoverPrimitive.Arrow
                                      className="
                                      fill-white stroke-gray-200 stroke-0 drop-shadow-md"
                                      width={16}
                                      height={8}
                                    />

                                    <PopoverHeader>
                                      <PopoverTitle className="flex flex-сol gap-1">
                                        <CircleAlert
                                          size={18}
                                          className="mt-0.5"
                                          fill="#faad14"
                                          color="white"
                                        />
                                        Удалить фото?
                                      </PopoverTitle>
                                      <PopoverDescription className="pl-5.5">
                                        <span>
                                          Это действие нельзя отменить
                                        </span>
                                      </PopoverDescription>
                                    </PopoverHeader>

                                    <div className="flex flex-row justify-end gap-2">
                                      <PopoverPrimitive.Close asChild>
                                        <Button
                                          variant="outline"
                                          size={'xs'}
                                          type="button"
                                          className="
                                        text-[12px]
                                        mt-2 
                                        text-black 
                                        rounded 
                                        hover:text-blue-400 
                                        hover:bg-amber-50/0 
                                        hover:border-blue-400
                                        active:hover:text-blue-500"
                                        >
                                          <span>Нет</span>
                                        </Button>
                                      </PopoverPrimitive.Close>

                                      <PopoverPrimitive.Close asChild>
                                        <Button
                                          size={'xs'}
                                          type="button"
                                          className="
                                        text-[12px]
                                        mt-2 
                                        bg-red-500 
                                        text-white 
                                        rounded 
                                        hover:bg-red-400
                                        active:hover:bg-blue-600"
                                          onClick={() => {
                                            handlePictureDelete(
                                              picture,
                                              product,
                                            )
                                          }}
                                        >
                                          <span>Да</span>
                                        </Button>
                                      </PopoverPrimitive.Close>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            ))}
                        </div>

                        <Input
                          type="file"
                          ref={fileInputRef}
                          onChange={(event) => handleFileChange(event, product)}
                          accept="image/*"
                          className="hidden"
                        />

                        <Button
                          variant="outline"
                          className="
                            cursor-pointer
                            w-38 
                          bg-blue-500
                          text-white rounded-1 
                          hover:bg-blue-400 
                          hover:text-white
                          active:bg-blue-600"
                          onClick={handleButtonClick}
                        >
                          <Plus />
                          <span>Добавить фото</span>
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </TableCell>

                  <TableCell
                    className="
                  border-r 
                  text-left 
                  w-2xs 
                  py-7 
                  px-3.5   
                  max-w-40
                  overflow-hidden
                  text-ellipsis"
                  >
                    {types.find((item) => item.value === product.type)?.label ||
                      'Не указано'}
                  </TableCell>
                  <TableCell
                    className="
                  border-r 
                  text-left
                  w-2xs
                  max-w-40
                  px-3.5
                  overflow-hidden
                  text-ellipsis"
                  >
                    {product.name}
                  </TableCell>
                  <TableCell
                    className="border-r 
                  text-left
                  w-800
                  px-3.5
                  max-w-136
                  overflow-hidden
                  text-ellipsis"
                  >
                    {product.description_short}
                  </TableCell>

                  <TableCell className="flex justify-center py-7 px-3.5">
                    <ButtonGroup className="">
                      <Dialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="cursor-pointer hover:border-blue-400 hover:text-blue-400"
                              >
                                <PenLine />
                              </Button>
                            </DialogTrigger>
                          </TooltipTrigger>

                          <TooltipContent
                            side="top"
                            className=" 
                            z-40 
                            animate-none 
                            shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                          >
                            <p>Редактировать номенклатуру</p>
                          </TooltipContent>
                        </Tooltip>

                        <DialogContent className="min-w-3xl">
                          <AddNomenclature
                            product={product}
                            handleProductEdit={handleProductEdit}
                          />
                        </DialogContent>
                      </Dialog>

                      <Popover>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="cursor-pointer hover:border-blue-400 hover:text-blue-400"
                              >
                                <Trash />
                              </Button>
                            </PopoverTrigger>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            sideOffset={2}
                            className="z-40 animate-none shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                          >
                            <p>Удалить номенклатуру</p>
                          </TooltipContent>
                        </Tooltip>

                        <PopoverContent
                          side="top"
                          sideOffset={4}
                          className="
                          z-50
                          w-46
                          p-3
                          bg-white
                          border-0
                          shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                        >
                          <PopoverPrimitive.Arrow
                            className="
                          fill-white stroke-gray-200 stroke-0 drop-shadow-md"
                            width={16}
                            height={8}
                          />

                          <div className="flex flex-row gap-1">
                            <CircleAlert
                              size={18}
                              fill="#faad14"
                              color="white"
                            />
                            <span className="text-[13px]">
                              Подтвердите удаление
                            </span>
                          </div>
                          <div className="flex flex-row justify-end gap-2">
                            <PopoverPrimitive.Close asChild>
                              <Button
                                variant="outline"
                                size={'xs'}
                                type="button"
                                className="
                                 text-[12px]
                                mt-2 
                                text-black 
                                rounded 
                                hover:text-blue-400 
                                hover:bg-amber-50/0 
                                hover:border-blue-400
                                active:hover:text-blue-500"
                              >
                                <span>Отмена</span>
                              </Button>
                            </PopoverPrimitive.Close>

                            <PopoverPrimitive.Close asChild>
                              <Button
                                size={'xs'}
                                type="button"
                                className="
                                text-[12px]
                                mt-2 
                                bg-blue-500 
                                text-white 
                                rounded 
                                hover:bg-blue-400
                                active:hover:bg-blue-600"
                                onClick={() => handleProductDelete(product)}
                              >
                                <span>ОК</span>
                              </Button>
                            </PopoverPrimitive.Close>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="cursor-pointer hover:border-blue-400 hover:text-blue-400"
                          >
                            <MoreHorizontalIcon />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>.</DropdownMenuItem>
                          <DropdownMenuItem>.</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            .
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      </div>
      <div className="flex justify-end">
        <Button
          disabled={currentPage === 1}
          className="cursor-pointer bg-transparent text-black transition-all duration-200 rounded hover:bg-gray-200 active:bg-gray-300"
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <ChevronLeft />
        </Button>

        <span className="p-1">
          {currentPage} / {totalPages || 1}
        </span>

        <Button
          disabled={currentPage >= totalPages}
          className="cursor-pointer bg-transparent text-black transition-all duration-200 rounded hover:bg-gray-200 active:bg-gray-300"
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
