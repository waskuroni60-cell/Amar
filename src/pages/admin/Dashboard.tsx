import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { campaigns as staticCampaigns } from '../../data/campaigns';
import { 
  LayoutDashboard, 
  Heart, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  LogOut,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  AlertCircle,
  X,
  Image as ImageIcon,
  MapPin,
  Calendar as CalendarIcon,
  Loader2,
  Database,
  Settings
} from 'lucide-react';
import { donationService, campaignService, paymentService, Donation, CampaignData, PaymentMethodConfig } from '../../services/firebaseService';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'donations' | 'campaigns' | 'settings'>('donations');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const navigate = useNavigate();

  const handleSeedData = async () => {
    if (window.confirm('আপনি কি প্রাথমিক ডাটা দিয়ে ডাটাবেস পূর্ণ করতে চান?')) {
      setIsSeeding(true);
      try {
        await campaignService.seedCampaigns(staticCampaigns as any);
        alert('ডাটা সফলভাবে সিড করা হয়েছে!');
        fetchData();
      } catch (error) {
        console.error("Error seeding data:", error);
        alert('ডাটা সিড করতে সমস্যা হয়েছে।');
      } finally {
        setIsSeeding(false);
      }
    }
  };

  // New Campaign Form State
  const [newCampaign, setNewCampaign] = useState({
    titleBn: '',
    descriptionBn: '',
    category: 'medical',
    location: '',
    targetAmount: 0,
    deadline: '',
    image: '',
    verified: true
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
    } else {
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [donationsData, campaignsData, paymentData] = await Promise.all([
        donationService.getDonations(),
        campaignService.getCampaigns(),
        paymentService.getPaymentMethods()
      ]);
      setDonations(donationsData);
      setCampaigns(campaignsData);
      setPaymentMethods(paymentData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = (id: string, icon: string) => {
    setPaymentMethods(prev => prev.map(pm => pm.id === id ? { ...pm, icon } : pm));
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await paymentService.updatePaymentMethods(paymentMethods);
      alert("পেমেন্ট মেথড সেটিংস সফলভাবে সেভ করা হয়েছে!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("সেটিংস সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/');
  };

  const handleUpdateDonationStatus = async (id: string, status: Donation['status']) => {
    try {
      await donationService.updateDonationStatus(id, status);
      setDonations(prev => prev.map(d => d.id === id ? { ...d, status } : d));
      
      // If verified, update campaign stats
      if (status === 'verified') {
        const donation = donations.find(d => d.id === id);
        if (donation) {
          const campaign = campaigns.find(c => c.id === donation.campaignId);
          if (campaign) {
            await campaignService.updateCampaign(campaign.id!, {
              raisedAmount: (campaign.raisedAmount || 0) + donation.amount,
              donorCount: (campaign.donorCount || 0) + 1
            });
            setCampaigns(prev => prev.map(c => c.id === campaign.id ? {
              ...c,
              raisedAmount: (c.raisedAmount || 0) + donation.amount,
              donorCount: (c.donorCount || 0) + 1
            } : c));
          }
        }
      }
    } catch (error) {
      console.error("Error updating donation status:", error);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই ক্যাম্পেইনটি ডিলিট করতে চান?')) {
      try {
        await campaignService.deleteCampaign(id);
        setCampaigns(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        console.error("Error deleting campaign:", error);
      }
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await campaignService.createCampaign({
        ...newCampaign,
        title: newCampaign.titleBn, // Use Bengali title for English field
        description: newCampaign.descriptionBn, // Use Bengali description for English field
        raisedAmount: 0,
        donorCount: 0
      });
      setIsAddModalOpen(false);
      setNewCampaign({
        titleBn: '',
        descriptionBn: '',
        category: 'medical',
        location: '',
        targetAmount: 0,
        deadline: '',
        image: '',
        verified: true
      });
      fetchData();
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("ক্যাম্পেইন তৈরি করা সম্ভব হয়নি।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalRaised = donations
    .filter(d => d.status === 'verified')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">
              আমার <span className="text-slate-900">সাধন</span>
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">এডমিন প্যানেল</p>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('donations')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'donations' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span>ডোনেশন লিস্ট</span>
          </button>
          <button 
            onClick={() => setActiveTab('campaigns')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'campaigns' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>ক্যাম্পেইন লিস্ট</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>সেটিংস</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>লগআউট</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-xl font-bold text-slate-900">
            {activeTab === 'donations' ? 'ডোনেশন ম্যানেজমেন্ট' : activeTab === 'campaigns' ? 'ক্যাম্পেইন ম্যানেজমেন্ট' : 'সিস্টেম সেটিংস'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">এডমিন</p>
              <p className="text-sm font-bold text-slate-900">Waskuroni</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              W
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex border-b border-slate-200 bg-white sticky top-20 z-20">
          <button 
            onClick={() => setActiveTab('donations')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'donations' ? 'border-primary text-primary' : 'border-transparent text-slate-400'
            }`}
          >
            ডোনেশন
          </button>
          <button 
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'campaigns' ? 'border-primary text-primary' : 'border-transparent text-slate-400'
            }`}
          >
            ক্যাম্পেইন
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-400'
            }`}
          >
            সেটিংস
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">+১২%</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">মোট সংগৃহীত</p>
              <h3 className="text-2xl font-black text-slate-900">৳{totalRaised.toLocaleString('bn-BD')}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">মোট দাতা</p>
              <h3 className="text-2xl font-black text-slate-900">{donations.length.toLocaleString('bn-BD')} জন</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">সক্রিয় ক্যাম্পেইন</p>
              <h3 className="text-2xl font-black text-slate-900">{campaigns.length.toLocaleString('bn-BD')} টি</h3>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="খুঁজুন..." 
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleSeedData}
                  disabled={isSeeding}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-sm font-bold border border-amber-100 hover:bg-amber-100 transition-all disabled:opacity-50"
                  title="Seed Initial Data"
                >
                  <Database className="w-4 h-4" />
                  <span>{isSeeding ? 'সিড হচ্ছে...' : 'ডাটা সিড'}</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-100 hover:bg-slate-100 transition-all">
                  <Filter className="w-4 h-4" />
                  <span>ফিল্টার</span>
                </button>
                {activeTab === 'campaigns' && (
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-light transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন ক্যাম্পেইন</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-24 text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-500 font-bold">লোড হচ্ছে...</p>
                </div>
              ) : activeTab === 'donations' ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">দাতা</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ক্যাম্পেইন</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">পরিমাণ</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">পদ্ধতি/TxID</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">স্ট্যাটাস</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {donations.length > 0 ? donations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-xs font-bold">
                              {donation.donorName ? donation.donorName[0] : 'A'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{donation.donorName || 'Anonymous'}</p>
                              <p className="text-[10px] text-slate-400">{donation.donorPhone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-700 line-clamp-1">{donation.campaignTitle}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-primary">৳{donation.amount.toLocaleString('bn-BD')}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-900 uppercase">{donation.method}</p>
                            <p className="text-[10px] font-mono text-slate-400">{donation.txId}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            donation.status === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                            donation.status === 'rejected' ? 'bg-red-50 text-red-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {donation.status === 'verified' ? 'ভেরিফাইড' :
                             donation.status === 'rejected' ? 'রিজেক্টেড' : 'পেন্ডিং'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {donation.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateDonationStatus(donation.id!, 'verified')}
                                  className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                  title="Verify"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleUpdateDonationStatus(donation.id!, 'rejected')}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">কোন ডোনেশন পাওয়া যায়নি</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : activeTab === 'campaigns' ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ক্যাম্পেইন</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ক্যাটাগরি</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">লক্ষ্য/সংগৃহীত</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">দাতা</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {campaigns.length > 0 ? campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img src={campaign.image} alt="" className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            <div>
                              <p className="text-sm font-bold text-slate-900 line-clamp-1">{campaign.titleBn}</p>
                              <p className="text-[10px] text-slate-400">{campaign.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{campaign.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-primary">৳{campaign.raisedAmount.toLocaleString('bn-BD')}</span>
                              <span className="text-slate-400">৳{campaign.targetAmount.toLocaleString('bn-BD')}</span>
                            </div>
                            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">{campaign.donorCount.toLocaleString('bn-BD')} জন</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                              <TrendingUp className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCampaign(campaign.id!)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">কোন ক্যাম্পেইন পাওয়া যায়নি</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 space-y-8">
                  <div className="max-w-2xl space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">পেমেন্ট মেথড সেটিংস</h3>
                      <p className="text-sm text-slate-500">বিকাশ, নগদ এবং রকেটের লোগো পরিবর্তন করুন। এই লোগোগুলো ইউজাররা ডোনেশন করার সময় দেখতে পাবেন।</p>
                    </div>

                    <div className="space-y-6">
                      {paymentMethods.map((pm) => (
                        <div key={pm.id} className="flex items-center space-x-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img src={pm.icon} alt={pm.name} className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-grow space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{pm.name} লোগো ইউআরএল</label>
                            <input 
                              type="url" 
                              value={pm.icon}
                              onChange={(e) => handleUpdatePaymentMethod(pm.id, e.target.value)}
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-light transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                    >
                      {isSavingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>সেটিংস সেভ করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Campaign Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-900">নতুন ক্যাম্পেইন তৈরি করুন</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateCampaign} className="p-8 space-y-6 overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">শিরোনাম (বাংলা)</label>
                  <input 
                    type="text" 
                    value={newCampaign.titleBn}
                    onChange={(e) => setNewCampaign({...newCampaign, titleBn: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">বর্ণনা (বাংলা)</label>
                  <textarea 
                    rows={4}
                    value={newCampaign.descriptionBn}
                    onChange={(e) => setNewCampaign({...newCampaign, descriptionBn: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ক্যাটাগরি</label>
                    <select 
                      value={newCampaign.category}
                      onChange={(e) => setNewCampaign({...newCampaign, category: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none"
                    >
                      <option value="medical">চিকিৎসা</option>
                      <option value="education">শিক্ষা</option>
                      <option value="mosque">মসজিদ</option>
                      <option value="disaster">দুর্যোগ</option>
                      <option value="poor">দরিদ্র সহায়তা</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">লোকেশন</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text" 
                        value={newCampaign.location}
                        onChange={(e) => setNewCampaign({...newCampaign, location: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        placeholder="ঢাকা, বাংলাদেশ"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">লক্ষ্য (৳)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="number" 
                        value={newCampaign.targetAmount}
                        onChange={(e) => setNewCampaign({...newCampaign, targetAmount: Number(e.target.value)})}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ডেডলাইন</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="date" 
                        value={newCampaign.deadline}
                        onChange={(e) => setNewCampaign({...newCampaign, deadline: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ইমেজ ইউআরএল</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="url" 
                        value={newCampaign.image}
                        onChange={(e) => setNewCampaign({...newCampaign, image: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        placeholder="https://..."
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary-light transition-all shadow-xl shadow-primary/20 flex items-center justify-center disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'ক্যাম্পেইন পাবলিশ করুন'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
