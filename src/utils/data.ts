import { ProductType, Shape, Material, Size, Color } from '../types';

export const PRODUCT_TYPES: ProductType[] = [
  {
    id: 'bag',
    name: 'bag',
    displayName: 'Сумка',
    image: process.env.PUBLIC_URL + '/images/products/sumka.jpeg',
    description: 'Стильная сумка с вашим дизайном'
  },
  {
    id: 'coaster',
    name: 'coaster',
    displayName: 'Подстаканник',
    image: process.env.PUBLIC_URL + '/images/products/podstakannik.JPEG',
    description: 'Элегантный подстаканник из бусин'
  },
  {
    id: 'individual',
    name: 'individual',
    displayName: 'Индивидуальный',
    image: process.env.PUBLIC_URL + '/images/products/nestandartnii.JPEG',
    description: 'Индивидуальные изделия ручной работы'
  }
];

export const SHAPES: Shape[] = [
  {
    id: 'round',
    name: 'round',
    displayName: 'Круглая',
    image: process.env.PUBLIC_URL + '/images/shapes/kruglaya.jpg',
    description: 'Классическая круглая форма'
  },
  {
    id: 'square',
    name: 'square',
    displayName: 'Квадратная',
    image: process.env.PUBLIC_URL + '/images/shapes/kvadratnaya.jpg',
    description: 'Современная квадратная форма'
  },
  {
    id: 'heart',
    name: 'heart',
    displayName: 'Сердце',
    image: process.env.PUBLIC_URL + '/images/shapes/serdce.jpg',
    description: 'Романтичная форма сердца'
  },
  {
    id: 'rectangle',
    name: 'rectangle',
    displayName: 'Прямоугольная',
    image: process.env.PUBLIC_URL + '/images/shapes/pryamougolnaya.jpg',
    description: 'Удобная прямоугольная форма'
  },
  {
    id: 'custom',
    name: 'custom',
    displayName: 'Кастомная',
    image: process.env.PUBLIC_URL + '/images/shapes/trapeciya.jpg',
    description: 'Индивидуальная форма по вашему дизайну'
  }
];

export const MATERIALS: Material[] = [
  {
    id: 'akril',
    name: 'akril',
    displayName: 'Акрил',
    image: process.env.PUBLIC_URL + '/images/materials/akril.jpg',
    description: 'Прочный и красивый акрил',
    price: 500
  },
  {
    id: 'hrustal',
    name: 'hrustal',
    displayName: 'Хрусталь',
    image: process.env.PUBLIC_URL + '/images/materials/hrustal.jpg',
    description: 'Элегантный хрусталь премиум качества',
    price: 1200
  },
  {
    id: 'swarovski',
    name: 'swarovski',
    displayName: 'Swarovski',
    image: process.env.PUBLIC_URL + '/images/materials/swarovski.jpg',
    description: 'Эксклюзивные кристаллы Swarovski',
    price: 2500
  }
];

export const SIZES: Size[] = [
  {
    id: 'small',
    name: 'small',
    displayName: 'Маленький',
    dimensions: '15x15 см',
    price: 100
  },
  {
    id: 'medium',
    name: 'medium',
    displayName: 'Средний',
    dimensions: '20x20 см',
    price: 150
  },
  {
    id: 'large',
    name: 'large',
    displayName: 'Большой',
    dimensions: '25x25 см',
    price: 200
  }
];

export const COLORS: Color[] = [
  { id: 'red', name: 'red', displayName: 'Красный', hex: '#FF0000' },
  { id: 'blue', name: 'blue', displayName: 'Синий', hex: '#0000FF' },
  { id: 'green', name: 'green', displayName: 'Зеленый', hex: '#00FF00' },
  { id: 'yellow', name: 'yellow', displayName: 'Желтый', hex: '#FFFF00' },
  { id: 'purple', name: 'purple', displayName: 'Фиолетовый', hex: '#800080' },
  { id: 'orange', name: 'orange', displayName: 'Оранжевый', hex: '#FFA500' },
  { id: 'pink', name: 'pink', displayName: 'Розовый', hex: '#FFC0CB' },
  { id: 'black', name: 'black', displayName: 'Черный', hex: '#000000' },
  { id: 'white', name: 'white', displayName: 'Белый', hex: '#FFFFFF' },
  { id: 'gray', name: 'gray', displayName: 'Серый', hex: '#808080' }
]; 