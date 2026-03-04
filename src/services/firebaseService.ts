import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Donation {
  id?: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  method: string;
  donorName: string;
  donorPhone: string;
  txId: string;
  message: string;
  isAnonymous: boolean;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: Timestamp;
}

export interface CampaignData {
  id?: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  category: string;
  location: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  deadline: string;
  image: string;
  verified: boolean;
  createdAt: Timestamp;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  icon: string;
}

const DONATIONS_COLLECTION = "donations";
const CAMPAIGNS_COLLECTION = "campaigns";
const SETTINGS_COLLECTION = "settings";
const PAYMENT_METHODS_DOC = "paymentMethods";

export const donationService = {
  async submitDonation(donation: Omit<Donation, 'id' | 'createdAt' | 'status'>) {
    return addDoc(collection(db, DONATIONS_COLLECTION), {
      ...donation,
      status: 'pending',
      createdAt: Timestamp.now()
    });
  },

  async getDonations() {
    const q = query(collection(db, DONATIONS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
  },

  async updateDonationStatus(id: string, status: Donation['status']) {
    const donationRef = doc(db, DONATIONS_COLLECTION, id);
    return updateDoc(donationRef, { status });
  }
};

export const campaignService = {
  async createCampaign(campaign: Omit<CampaignData, 'id' | 'createdAt'>) {
    return addDoc(collection(db, CAMPAIGNS_COLLECTION), {
      ...campaign,
      createdAt: Timestamp.now()
    });
  },

  async getCampaigns() {
    const q = query(collection(db, CAMPAIGNS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CampaignData));
  },

  async updateCampaign(id: string, data: Partial<CampaignData>) {
    const campaignRef = doc(db, CAMPAIGNS_COLLECTION, id);
    return updateDoc(campaignRef, data);
  },

  async deleteCampaign(id: string) {
    const campaignRef = doc(db, CAMPAIGNS_COLLECTION, id);
    return deleteDoc(campaignRef);
  },

  async seedCampaigns(campaigns: any[]) {
    const batch = campaigns.map(c => this.createCampaign(c));
    return Promise.all(batch);
  }
};

export const paymentService = {
  async getPaymentMethods(): Promise<PaymentMethodConfig[]> {
    const docRef = doc(db, SETTINGS_COLLECTION, PAYMENT_METHODS_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().methods as PaymentMethodConfig[];
    }
    return [
      { id: 'bkash', name: 'bKash', icon: 'https://raw.githubusercontent.com/S-M-A-K-H/BD-Payment-Gateway-Icons/main/bkash.png' },
      { id: 'nagad', name: 'Nagad', icon: 'https://raw.githubusercontent.com/S-M-A-K-H/BD-Payment-Gateway-Icons/main/nagad.png' },
      { id: 'rocket', name: 'Rocket', icon: 'https://raw.githubusercontent.com/S-M-A-K-H/BD-Payment-Gateway-Icons/main/rocket.png' },
    ];
  },

  async updatePaymentMethods(methods: PaymentMethodConfig[]) {
    const docRef = doc(db, SETTINGS_COLLECTION, PAYMENT_METHODS_DOC);
    return setDoc(docRef, { methods });
  }
};
