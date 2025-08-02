import { ProductType, Shape, Material, Size, Color } from '../types';

export const PRODUCT_TYPES: ProductType[] = [
  {
    id: 'bag',
    name: 'bag',
    displayName: 'Сумка',
    image: '/images/products/bag.jpg',
    description: 'Стильная сумка с вашим дизайном'
  },
  {
    id: 'coaster',
    name: 'coaster',
    displayName: 'Подстаканник',
    image: '/images/products/coaster.jpg',
    description: 'Красивый подстаканник для напитков'
  },
  {
    id: 'earrings',
    name: 'earrings',
    displayName: 'Серьги',
    image: '/images/products/earrings.jpg',
    description: 'Элегантные серьги ручной работы'
  }
];

export const SHAPES: Shape[] = [
  {
    id: 'round',
    name: 'round',
    displayName: 'Круглая',
    image: '/images/bags/shapes/round.jpg',
    description: 'Классическая круглая форма'
  },
  {
    id: 'square',
    name: 'square',
    displayName: 'Квадратная',
    image: '/images/bags/shapes/square.jpg',
    description: 'Современная квадратная форма'
  },
  {
    id: 'heart',
    name: 'heart',
    displayName: 'Сердце',
    image: '/images/bags/shapes/heart.jpg',
    description: 'Романтичная форма сердца'
  },
  {
    id: 'rectangular',
    name: 'rectangular',
    displayName: 'Прямоугольная',
    image: '/images/bags/shapes/rectangular.jpg',
    description: 'Практичная прямоугольная форма'
  },
  {
    id: 'custom',
    name: 'custom',
    displayName: 'Нестандартная',
    image: '/images/bags/shapes/custom.jpg',
    description: 'Индивидуальная форма по вашему эскизу'
  }
];

export const MATERIALS: Material[] = [
  {
    id: 'akril',
    name: 'akril',
    displayName: 'Акрил',
    image: '/images/bags/materials/akril.jpg',
    description: 'Прочный и красивый акрил',
    price: 500
  },
  {
    id: 'hrustal',
    name: 'hrustal',
    displayName: 'Хрусталь',
    image: '/images/bags/materials/hrustal.jpg',
    description: 'Элегантный хрусталь',
    price: 800
  },
  {
    id: 'swarovski',
    name: 'swarovski',
    displayName: 'Сваровски',
    image: '/images/bags/materials/swarovski.jpg',
    description: 'Роскошные кристаллы Swarovski',
    price: 1200
  }
];

export const SIZES: Size[] = [
  {
    id: 'small',
    name: 'small',
    displayName: 'Маленький',
    width: 10,
    height: 10,
    price: 0
  },
  {
    id: 'medium',
    name: 'medium',
    displayName: 'Средний',
    width: 15,
    height: 15,
    price: 200
  },
  {
    id: 'large',
    name: 'large',
    displayName: 'Большой',
    width: 20,
    height: 20,
    price: 400
  }
];

export const COLORS: Color[] = [
  {
    id: 'red',
    name: 'red',
    hex: '#FF0000',
    displayName: 'Красный'
  },
  {
    id: 'blue',
    name: 'blue',
    hex: '#0000FF',
    displayName: 'Синий'
  },
  {
    id: 'green',
    name: 'green',
    hex: '#00FF00',
    displayName: 'Зеленый'
  },
  {
    id: 'yellow',
    name: 'yellow',
    hex: '#FFFF00',
    displayName: 'Желтый'
  },
  {
    id: 'purple',
    name: 'purple',
    hex: '#800080',
    displayName: 'Фиолетовый'
  },
  {
    id: 'pink',
    name: 'pink',
    hex: '#FFC0CB',
    displayName: 'Розовый'
  },
  {
    id: 'orange',
    name: 'orange',
    hex: '#FFA500',
    displayName: 'Оранжевый'
  },
  {
    id: 'black',
    name: 'black',
    hex: '#000000',
    displayName: 'Черный'
  },
  {
    id: 'white',
    name: 'white',
    hex: '#FFFFFF',
    displayName: 'Белый'
  }
]; 