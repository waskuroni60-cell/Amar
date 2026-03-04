import { useLanguage } from '../hooks/useLanguage';
import { campaigns as staticCampaigns } from '../data/campaigns';
import CampaignCard from '../components/CampaignCard';
import { Search, Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { campaignService, CampaignData } from '../services/firebaseService';

export default function Campaigns() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await campaignService.getCampaigns();
        if (data.length === 0) {
          // If no campaigns in Firebase, use static ones for now
          setCampaigns(staticCampaigns as any);
        } else {
          setCampaigns(data);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setCampaigns(staticCampaigns as any);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.titleBn.includes(searchQuery);
        const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'urgent') return (b.targetAmount - b.raisedAmount) - (a.targetAmount - a.raisedAmount);
        if (sortBy === 'funded') return (b.raisedAmount / b.targetAmount) - (a.raisedAmount / a.targetAmount);
        return 0;
      });
  }, [searchQuery, selectedCategory, sortBy, campaigns]);

  const categories = [
    { id: 'all', label: t('campaigns.all') },
    { id: 'medical', label: t('cat.medical') },
    { id: 'education', label: t('cat.education') },
    { id: 'mosque', label: t('cat.mosque') },
    { id: 'disaster', label: t('cat.disaster') },
    { id: 'poor', label: t('cat.poor') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">{t('nav.campaigns')}</h1>
        <p className="text-slate-500">{t('campaigns.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-10 pr-8 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none font-bold text-sm text-slate-700"
            >
              <option value="latest">{t('sort.latest')}</option>
              <option value="urgent">{t('sort.urgent')}</option>
              <option value="funded">{t('sort.funded')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-500 font-bold">{t('loading') || 'লোড হচ্ছে...'}</p>
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign as any} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 space-y-4">
          <div className="text-6xl">🔍</div>
          <h3 className="text-xl font-bold text-slate-900">{t('campaigns.notfound')}</h3>
          <p className="text-slate-500">{t('campaigns.notfound.desc')}</p>
        </div>
      )}
    </div>
  );
}
