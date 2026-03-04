export interface Campaign {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  category: 'medical' | 'education' | 'mosque' | 'disaster' | 'poor';
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  image: string;
  deadline: string;
  location: string;
  verified: boolean;
}

export const campaigns: Campaign[] = [
  {
    id: '1',
    title: 'Emergency Surgery for Cancer Patient',
    titleBn: 'ক্যান্সারে আক্রান্ত বাবার চিকিৎসার জন্য জরুরি সহায়তা',
    description: 'Mr. Abdur Rahman is suffering from stage 3 lung cancer. He was the only breadwinner for his family of five. Now, they are struggling to pay for his chemotherapy and surgery.',
    descriptionBn: 'আব্দুর রহমান সাহেব ফুসফুসের ক্যান্সারে (স্টেজ ৩) আক্রান্ত। পাঁচ সদস্যের পরিবারের একমাত্র উপার্জনক্ষম ব্যক্তি ছিলেন তিনি। এখন তার কেমোথেরাপি এবং অপারেশনের খরচ জোগাতে পরিবারটি হিমশিম খাচ্ছে। আপনার সামান্য সাহায্য একটি জীবন বাঁচাতে পারে।',
    category: 'medical',
    targetAmount: 800000,
    raisedAmount: 150000,
    donorCount: 45,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    deadline: '2026-04-15',
    location: 'Rangpur, Bangladesh',
    verified: true,
  },
  {
    id: '2',
    title: 'Support for a Reverted Muslim Divorced Sister',
    titleBn: 'অসহায় নওমুসলিম ডিভোর্সি বোনের আত্মনির্ভরশীল হওয়ার লড়াই',
    description: 'A sister who recently accepted Islam was divorced by her family and husband. She has two small children and no place to stay. We want to help her start a small tailoring business.',
    descriptionBn: 'একজন বোন যিনি সম্প্রতি ইসলাম গ্রহণ করেছেন, তাকে তার পরিবার ও স্বামী ত্যাগ করেছে। দুই ছোট সন্তান নিয়ে তিনি এখন আশ্রয়হীন। আমরা তাকে একটি সেলাই মেশিন এবং ছোট ব্যবসা শুরু করতে সাহায্য করতে চাই যাতে তিনি সম্মানের সাথে বাঁচতে পারেন।',
    category: 'poor',
    targetAmount: 50000,
    raisedAmount: 12000,
    donorCount: 18,
    image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&q=80&w=800',
    deadline: '2026-05-01',
    location: 'Bogura, Bangladesh',
    verified: true,
  },
  {
    id: '3',
    title: 'Treatment for Severe Accident Victim',
    titleBn: 'ভয়াবহ সড়ক দুর্ঘটনায় আহত যুবকের পচনশীল ক্ষতের চিকিৎসা',
    description: 'Sujon met with a terrible road accident. His leg has developed a severe infection and is decaying. Doctors say immediate specialized treatment is needed to avoid amputation.',
    descriptionBn: 'সুজন এক ভয়াবহ সড়ক দুর্ঘটনার শিকার হন। তার পায়ে মারাত্মক ইনফেকশন হয়ে পচন ধরেছে। চিকিৎসকরা বলছেন, পা কাটা পড়া থেকে বাঁচাতে দ্রুত উন্নত চিকিৎসা প্রয়োজন। তার দরিদ্র বাবা-মায়ের পক্ষে এই খরচ বহন করা অসম্ভব।',
    category: 'medical',
    targetAmount: 300000,
    raisedAmount: 85000,
    donorCount: 62,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    deadline: '2026-03-30',
    location: 'Mymensingh, Bangladesh',
    verified: true,
  },
  {
    id: '4',
    title: 'Food for Extremely Poor Families in Remote Village',
    titleBn: 'দুর্গম চরাঞ্চলের অতি দরিদ্র পরিবারগুলোর জন্য খাদ্য সহায়তা',
    description: 'In the remote char areas of Kurigram, many families are living in extreme poverty, often going days without a proper meal. We aim to provide basic food supplies to 100 such families.',
    descriptionBn: 'কুড়িগ্রামের দুর্গম চরাঞ্চলে অনেক পরিবার চরম দারিদ্র্যের মধ্যে বাস করছে, প্রায়ই তারা অভুক্ত থাকে। আমরা এমন ১০০টি পরিবারকে চাল, ডাল, তেলসহ নিত্যপ্রয়োজনীয় খাদ্য সামগ্রী পৌঁছে দিতে চাই।',
    category: 'poor',
    targetAmount: 200000,
    raisedAmount: 45000,
    donorCount: 35,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    deadline: '2026-04-10',
    location: 'Kurigram, Bangladesh',
    verified: true,
  },
  {
    id: '5',
    title: 'Education for Rural Children',
    titleBn: 'গ্রামের সুবিধাবঞ্চিত শিশুদের শিক্ষার আলো',
    description: 'Help us build a small learning center for children in a remote village where the nearest school is 10km away.',
    descriptionBn: 'একটি প্রত্যন্ত গ্রামে শিশুদের জন্য একটি ছোট শিক্ষা কেন্দ্র তৈরি করতে আমাদের সাহায্য করুন যেখানে নিকটতম স্কুলটি ১০ কিলোমিটার দূরে। আপনার দান তাদের ভবিষ্যৎ বদলে দিতে পারে।',
    category: 'education',
    targetAmount: 150000,
    raisedAmount: 30000,
    donorCount: 22,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    deadline: '2026-06-15',
    location: 'Sunamganj, Bangladesh',
    verified: true,
  }
];
