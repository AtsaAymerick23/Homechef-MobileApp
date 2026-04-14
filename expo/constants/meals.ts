export interface Meal {
  id: string;
  name: string;
  region: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  image: string;
  videoUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  costPerServing: number;
  ingredients: string[];
  instructions: string[];
  category: string;
  isFeatured?: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string;
  isUpcoming: boolean;
}

export interface UserRecipe {
  id: string;
  userId: string;
  name: string;
  description: string;
  images: string[];
  ingredients: string[];
  instructions: string[];
  createdAt: string;

  
}

export interface CookingHistory {
  id: string;
  mealId: string;
  mealName: string;
  mealImage: string;
  peopleCount: number;
  timesToEat: number;
  totalCost: number;
  totalTime: number;
  cookedAt: string;
}

export const meals: Meal[] = [
  {
    id: '1',
    name: 'Ndolé',
    region: 'Littoral',
    difficulty: 'Medium',
    description: 'A beloved Cameroonian dish made with bitterleaf greens, peanuts, and crayfish. Often called the national dish of Cameroon.',
    image: 'https://images.squarespace-cdn.com/content/v1/5e04d1c138bd0a5d714cea2b/1615411039884-HLYF8GGIP67LFLCYN21D/Ndole-cameroon+cuisine-kengs+kitchen2.jpg',
    videoUrl: 'https://example.com/ndole-video',
    prepTime: 30,
    cookTime: 45,
    servings: 4,
    costPerServing: 2500,
    category: 'Main Course',
    ingredients: [
      '500g bitterleaf (ndolé), washed and drained',
      '200g raw peanuts',
      '200g crayfish',
      '2 large onions, chopped',
      '3 cloves garlic, minced',
      '200g beef or shrimp',
      '1 cup palm oil',
      '2 Maggi cubes',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Wash bitterleaf thoroughly to remove bitterness, then boil and drain',
      'Blend peanuts with water to make a smooth paste',
      'Fry onions and garlic in palm oil until fragrant',
      'Add meat and cook until browned',
      'Add crayfish, peanut paste, and bitterleaf',
      'Simmer for 30-40 minutes until flavors meld',
      'Season with Maggi cubes, salt, and pepper',
      'Serve hot with boiled plantains or bobolo'
    ]
  },
  {
    id: '2',
    name: 'Poulet DG',
    region: 'Centre',
    difficulty: 'Medium',
    description: 'A sumptuous dish of fried plantains and chicken, typically served to high-ranking officials (DG = Directeur Général).',
    image: 'https://i0.wp.com/www.yummymedley.com/wp-content/uploads/2017/06/01-Cameroonian-Poulet-DG-Top-Shot.jpg?w=750&ssl=1/',
    videoUrl: 'https://example.com/poulet-dg-video',
    prepTime: 25,
    cookTime: 40,
    servings: 6,
    costPerServing: 3500,
    category: 'Main Course',
    isFeatured: true,
    ingredients: [
      '1 whole chicken, cut into pieces',
      '4 ripe plantains, sliced',
      '3 carrots, sliced',
      '2 green bell peppers, sliced',
      '2 onions, sliced',
      '3 tomatoes, diced',
      '200g green beans',
      'Palm oil for frying',
      'Garlic, ginger, and spices'
    ],
    instructions: [
      'Marinate chicken with spices, garlic, and ginger',
      'Fry plantain slices until golden brown, set aside',
      'Fry chicken pieces until crispy and cooked through',
      'Sauté onions, tomatoes, and vegetables',
      'Combine chicken and vegetables in a pot',
      'Add seasonings and simmer for 15 minutes',
      'Add fried plantains and gently mix',
      'Garnish with fresh herbs and serve'
    ]
  },
  {
    id: '3',
    name: 'Koki Beans',
    region: 'Littoral',
    difficulty: 'Easy',
    description: 'Traditional steamed bean pudding made from black-eyed peas, wrapped and cooked in banana leaves.',
    image: 'https://www.africanbites.com/wp-content/uploads/2025/08/Koki-Beans-1.jpg',
    videoUrl: 'https://example.com/koki-video',
    prepTime: 45,
    cookTime: 60,
    servings: 8,
    costPerServing: 1200,
    category: 'Side Dish',
    ingredients: [
      '500g dried black-eyed peas',
      '1 cup palm oil',
      '2 onions, finely chopped',
      '1 cup crayfish, ground',
      'Banana leaves for wrapping',
      'Salt and pepper to taste',
      'Hot peppers (optional)'
    ],
    instructions: [
      'Soak beans overnight, then peel off skins',
      'Grind beans into a smooth paste',
      'Mix in palm oil, onions, and crayfish',
      'Season with salt and pepper',
      'Wrap mixture in banana leaves',
      'Steam for 1-2 hours until firm',
      'Serve warm with ripe plantains or cassava'
    ]
  },
  {
    id: '4',
    name: 'Eru',
    region: 'South West',
    difficulty: 'Hard',
    description: 'A hearty soup from the South West region made with finely sliced eru leaves, waterleaf, and assorted meats.',
    image: 'https://foodinvitecameroon.com/wp-content/uploads/2022/01/Eru.-600x525.png',
    videoUrl: 'https://example.com/eru-video',
    prepTime: 40,
    cookTime: 50,
    servings: 6,
    costPerServing: 4000,
    category: 'Soup',
    ingredients: [
      '500g eru leaves, finely sliced',
      '500g waterleaf',
      'Assorted meats (beef, tripe, skin)',
      '200g crayfish',
      '2 cups palm oil',
      'Stock fish and dried fish',
      'Pepper and seasonings'
    ],
    instructions: [
      'Boil meats with seasonings until tender',
      'Add stock fish and dried fish',
      'Add palm oil and allow to simmer',
      'Add waterleaf and cook until wilted',
      'Stir in eru leaves gradually',
      'Add crayfish and pepper',
      'Simmer for 20 minutes',
      'Serve with water fufu or garri'
    ]
  },
  {
    id: '5',
    name: 'Achu and Yellow Soup',
    region: 'North West',
    difficulty: 'Hard',
    description: 'A traditional dish from the North West, featuring pounded cocoyams served with a rich yellow soup.',
    image: 'https://theafrikanstore.com/cdn/shop/articles/achu_soup_900x@2x.jpg?v=1694519397',
    videoUrl: 'https://example.com/achu-video',
    prepTime: 60,
    cookTime: 90,
    servings: 6,
    costPerServing: 3000,
    category: 'Main Course',
    ingredients: [
      '2kg cocoyams',
      '1kg beef and assorted meats',
      'Limestone (kanwa) for soup',
      'Palm oil',
      'Crayfish and spices',
      'Pepper and salt',
      'Banana leaves for serving'
    ],
    instructions: [
      'Boil cocoyams until very soft',
      'Pound cocoyams in mortar until smooth',
      'Boil meats with seasonings',
      'Prepare yellow soup with limestone water',
      'Add palm oil to create yellow color',
      'Add meats, crayfish, and spices',
      'Wrap pounded achu in banana leaves',
      'Serve with yellow soup poured over'
    ]
  },
  {
    id: '6',
    name: 'Sanga',
    region: 'Centre',
    difficulty: 'Easy',
    description: 'A simple yet delicious dish of mashed corn and beans, popular in the Centre region.',
    image: 'https://epiceries-staffsas.com/cdn/shop/files/Platdesanga_1.jpg?v=1707944892&width=600',
    videoUrl: 'https://example.com/sanga-video',
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    costPerServing: 800,
    category: 'Main Course',
    ingredients: [
      '2 cups dried corn',
      '1 cup black beans',
      '1/2 cup palm oil',
      '1 onion, chopped',
      'Salt to taste',
      'Pepper (optional)'
    ],
    instructions: [
      'Soak corn and beans overnight separately',
      'Boil corn until half cooked',
      'Add beans and continue cooking',
      'When soft, mash together lightly',
      'Fry onions in palm oil',
      'Mix oil and onions into corn-bean mixture',
      'Season with salt and pepper',
      'Serve warm with vegetables'
    ]
  },
  {
    id: '7',
    name: 'Mbongo Tchobi',
    region: 'Littoral',
    difficulty: 'Medium',
    description: 'A distinctive black soup made with burnt mbongo spices, giving it a unique dark color and smoky flavor.',
    image: 'https://homepressurecooking.com/wp-content/uploads/2024/07/mbongo-tchobi-stew-recipe-1721660815.jpg',
    videoUrl: 'https://example.com/mbongo-video',
    prepTime: 30,
    cookTime: 60,
    servings: 4,
    costPerServing: 2800,
    category: 'Soup',
    ingredients: [
      'Mbongo spices (burnt and ground)',
      '1kg fresh fish or meat',
      '2 cups palm oil',
      'Onions and garlic',
      'Crayfish',
      'Pepper and salt',
      'Njansa (optional)'
    ],
    instructions: [
      'Burn mbongo spices carefully until black',
      'Grind burnt spices to fine powder',
      'Boil meat or fish with seasonings',
      'Add palm oil and mbongo powder',
      'Stir until soup turns black',
      'Add crayfish and njansa',
      'Simmer for 30 minutes',
      'Serve with boiled plantains'
    ]
  },
  {
    id: '8',
    name: 'Kondre',
    region: 'West',
    difficulty: 'Medium',
    description: 'A hearty one-pot meal from the West region made with plantains, meats, and vegetables.',
    image: 'https://i0.wp.com/laviebami.com/wp-content/uploads/2022/05/DSC05921-2-scaled.jpg?resize=1536%2C1024&ssl=1',
    videoUrl: 'https://example.com/kondre-video',
    prepTime: 20,
    cookTime: 50,
    servings: 6,
    costPerServing: 2200,
    category: 'Main Course',
    ingredients: [
      '6 plantains (semi-ripe)',
      '500g meat (beef/pork/chicken)',
      '2 cups palm oil',
      '3 tomatoes, blended',
      '2 onions, chopped',
      'Ginger and garlic',
      'Leeks and celery',
      'Seasonings'
    ],
    instructions: [
      'Cut plantains into chunks',
      'Season and brown the meat',
      'Add tomatoes, onions, and spices',
      'Add plantains and enough water',
      'Cook until plantains are soft',
      'Add leeks and celery',
      'Simmer until thick consistency',
      'Serve hot'
    ]
  }
];

export const events: Event[] = [
  {
    id: '1',
    title: 'Festival de la Gastronomie Camerounaise',
    date: '2024-02-15',
    location: 'Yaoundé, Hilton Hotel',
    description: 'Annual celebration of Cameroonian cuisine featuring top chefs, cooking competitions, and food tastings from all regions.',
    image: 'https://www.cameroon-tribune.cm//administrateur/photo/normal_6adfe8b.jpg',
    isUpcoming: true
  },
  {
    id: '2',
    title: 'Douala Street Food Festival',
    date: '2024-03-20',
    location: 'Douala, Bonanjo',
    description: 'Experience the vibrant street food culture of Douala with vendors from across the city.',
    image: 'https://festival.afrifoodnetwork.com/wp-content/uploads/2025/09/IMG_0424-2048x1366.jpeg',
    isUpcoming: true
  },
  {
    id: '3',
    title: 'Traditional Cooking Workshop',
    date: '2023-11-10',
    location: 'Bamenda, Community Center',
    description: 'Learn traditional North West cooking techniques from local grandmothers.',
    image: 'https://www.globe-gazers.com/wp-content/uploads/2023/05/Oaxaca-cooking-classes-ingredients.jpg',
    isUpcoming: false
  },
  {
    id: '4',
    title: 'Seafood Excellence Week',
    date: '2026-04-05',
    location: 'Limbe, Down Beach',
    description: 'A week-long celebration of Cameroonian seafood dishes with live cooking demonstrations.',
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800',
    isUpcoming: true
  }
];

export const foodFacts = [
  'Cameroon is known as "Africa in miniature" due to its diverse geography and culture, reflected in its cuisine.',
  'Ndolé is considered the national dish of Cameroon, originating from the Douala people.',
  'Poulet DG was traditionally served only to high-ranking company directors (DGs) in Cameroon.',
  'The word "Achu" comes from the cocoyam tuber that is pounded to make the dish.',
  'Cameroonian cuisine uses over 50 different types of leafy vegetables in various dishes.',
  'Palm wine, called "matango" or "mba", is a traditional alcoholic beverage enjoyed with meals.',
  'The use of crayfish in Cameroonian cooking adds a unique umami flavor to soups and stews.',
  'Banana leaves are not just for wrapping - they also impart a subtle flavor to dishes like Koki.',
  'Cameroon produces over 300 varieties of bananas and plantains, essential to many dishes.',
  'The practice of pounding fufu is a communal activity in many Cameroonian households.'
];

export const restaurantPartners = [
  {
    id: '1',
    name: 'Le Fulya',
    location: 'Yaounde,Odza',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/d7/ba/28/l-atmosphere-du-bar-est.jpg?w=1400&h=700&s=1',
    description: 'Fine dining with traditional Cameroonian flavors',
    link: 'https://www.tripadvisor.com/Restaurant_Review-g293773-d27593680-Reviews-LE_FULYA_Lounge-Yaounde_Centre_Region.html'
  },
  {
    id: '2',
    name: 'KOTCHA Restaurant',
    location: 'Douala,Rue Christian Tobie',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/81/9a/73/amongst-earthy-tones.jpg?w=1400&h=800&s=1',
    description: 'KOTCHA Restaurant do offer International and Cameroonian food taste twisted with several Mediterranean, French and Italian touches.',
    link: 'https://www.tripadvisor.com/Restaurant_Review-g297392-d23826111-Reviews-Kotcha_Restaurant-Douala_Littoral_Region.html'
    
  },
  {
    id: '3',
    name: 'Beirut',
    location: 'Buea, Maliko City',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/e1/7f/5c/caption.jpg?w=1400&h=800&s=1',
    description: 'Lebanese, Pizza, Fast Food, Mediterranean',
    link: 'https://www.tripadvisor.com/Restaurant_Review-g482837-d23739090-Reviews-Beirut-Buea_Southwest_Region.html'
  }
];
