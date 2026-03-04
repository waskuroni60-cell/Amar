import { useLanguage } from '../hooks/useLanguage';
import { campaigns as staticCampaigns } from '../data/campaigns';
import CampaignCard from '../components/CampaignCard';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Zap, HeartHandshake, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { campaignService, CampaignData } from '../services/firebaseService';

export default function Home() {
  const { t } = useLanguage();
  const [featuredCampaigns, setFeaturedCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await campaignService.getCampaigns();
        if (data.length === 0) {
          setFeaturedCampaigns(staticCampaigns.slice(0, 3) as any);
        } else {
          setFeaturedCampaigns(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching featured campaigns:", error);
        setFeaturedCampaigns(staticCampaigns.slice(0, 3) as any);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { id: 'medical', icon: '🏥', label: t('cat.medical') },
    { id: 'education', icon: '📚', label: t('cat.education') },
    { id: 'mosque', icon: '🕌', label: t('cat.mosque') },
    { id: 'disaster', icon: '🌊', label: t('cat.disaster') },
    { id: 'poor', icon: '🤝', label: t('cat.poor') },
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1920"
            alt="Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/20 backdrop-blur-md border border-primary/30 px-4 py-2 rounded-full">
              <Star className="w-4 h-4 text-primary fill-current" />
              <span className="text-primary-light text-xs font-bold uppercase tracking-widest">{t('hero.trusted')}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl text-slate-200 leading-relaxed max-w-lg">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/campaigns"
                className="bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-primary-light transition-all shadow-xl shadow-primary/20 flex items-center justify-center group"
              >
                {t('hero.cta')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full text-lg font-bold hover:bg-white/20 transition-all flex items-center justify-center"
              >
                {t('hero.learn')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">{t('categories.title')}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center cursor-pointer group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <span className="text-sm font-bold text-slate-700">{cat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('featured.title')}</h2>
            <p className="text-slate-500">{t('featured.subtitle')}</p>
          </div>
          <Link to="/campaigns" className="text-primary font-bold flex items-center hover:underline">
            {t('featured.viewall')} <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-slate-500 font-bold">লোড হচ্ছে...</p>
            </div>
          ) : featuredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign as any} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-primary/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('how.title')}</h2>
            <p className="text-slate-500">{t('how.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Star className="w-8 h-8" />, title: t('how.step1'), desc: t('how.step1.desc') },
              { icon: <ShieldCheck className="w-8 h-8" />, title: t('how.step2'), desc: t('how.step2.desc') },
              { icon: <HeartHandshake className="w-8 h-8" />, title: t('how.step3'), desc: t('how.step3.desc') },
            ].map((step, idx) => (
              <div key={idx} className="text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-primary">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center space-y-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[100px]" />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 bg-primary/20 text-primary-light px-4 py-2 rounded-full text-sm font-bold border border-primary/30">
              <ShieldCheck className="w-5 h-5" />
              <span>{t('trust.badge')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">{t('trust.title')}</h2>
            <p className="text-slate-400 text-lg">
              {t('trust.desc')}
            </p>
          </div>
          
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
            {[
              { label: t('stat.raised'), value: '৳৫.২ কোটি+' },
              { label: t('stat.verified'), value: '১,২০০+' },
              { label: t('stat.donors'), value: '৫০,০০০+' },
              { label: t('stat.success'), value: '৯৮%' },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-3xl font-black text-primary-light">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
