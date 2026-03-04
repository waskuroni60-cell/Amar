import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { campaigns as staticCampaigns } from '../data/campaigns';
import { 
  BadgeCheck, Users, MapPin, Calendar, Share2, 
  Flag, Facebook, MessageCircle, Twitter, ArrowLeft,
  ShieldCheck, AlertCircle, Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import DonationModal from '../components/DonationModal';
import { campaignService, paymentService, CampaignData, PaymentMethodConfig } from '../services/firebaseService';

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignsData, paymentData] = await Promise.all([
          campaignService.getCampaigns(),
          paymentService.getPaymentMethods()
        ]);
        
        const found = campaignsData.find(c => c.id === id);
        if (found) {
          setCampaign(found);
        } else {
          const staticFound = staticCampaigns.find(c => c.id === id);
          if (staticFound) setCampaign(staticFound as any);
        }
        setPaymentMethods(paymentData);
      } catch (error) {
        console.error("Error fetching data:", error);
        const staticFound = staticCampaigns.find(c => c.id === id);
        if (staticFound) setCampaign(staticFound as any);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-500 font-bold">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold">{t('details.notfound')}</h2>
        <button onClick={() => navigate('/campaigns')} className="text-primary mt-4">{t('details.back')}</button>
      </div>
    );
  }

  const progress = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-bold text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('details.back.short')}
          </button>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-primary">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-red-500">
              <Flag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Main Info */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
              <div className="aspect-video relative">
                <img 
                  src={campaign.image} 
                  alt={campaign.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-white/90 backdrop-blur-md text-primary text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                    {t(`cat.${campaign.category}`)}
                  </span>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-primary" /> {campaign.location}</span>
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5 text-primary" /> {new Date(campaign.deadline).toLocaleDateString('bn-BD')}</span>
                  {campaign.verified && (
                    <span className="flex items-center text-primary bg-primary/10 px-3 py-1 rounded-full">
                      <BadgeCheck className="w-4 h-4 mr-1.5" /> {t('details.verified')}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                  {language === 'en' ? campaign.title : campaign.titleBn}
                </h1>

                {/* Payment Instructions for Trust */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                    {language === 'en' ? 'How to Donate' : 'কিভাবে টাকা দিবেন?'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">
                        {language === 'en' 
                          ? '1. Send Money to our personal number:' 
                          : '১. আমাদের পার্সোনাল নাম্বারে সেন্ড মানি করুন:'}
                      </p>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono font-bold text-lg text-center">
                        01889411602
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">
                        {language === 'en' 
                          ? '2. Supported Methods:' 
                          : '২. সমর্থিত মাধ্যমসমূহ:'}
                      </p>
                      <div className="flex items-center space-x-4 bg-white p-3 rounded-xl border border-slate-200 justify-center">
                        {paymentMethods.map(pm => (
                          <img key={pm.id} src={pm.icon} alt={pm.name} className="h-5 object-contain" referrerPolicy="no-referrer" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    {language === 'en'
                      ? '* After sending money, click the "Donate" button to submit your transaction details.'
                      : '* টাকা পাঠানোর পর "দান করুন" বাটনে ক্লিক করে আপনার ট্রানজ্যাকশন তথ্য জমা দিন।'}
                  </p>
                </div>

                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                    {language === 'en' ? campaign.description : campaign.descriptionBn}
                  </p>
                </div>

                {/* Share Buttons */}
                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">{t('details.share')}</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center space-x-2 bg-[#1877F2] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                      <Facebook className="w-5 h-5" />
                      <span>Facebook</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                      <MessageCircle className="w-5 h-5" />
                      <span>WhatsApp</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-[#1DA1F2] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                      <Twitter className="w-5 h-5" />
                      <span>Twitter</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust & FAQ */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-start space-x-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900">{t('details.guarantee.title')}</h3>
                  <p className="text-sm text-slate-600 mt-1">{t('details.guarantee.desc')}</p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">{t('details.faq.title')}</h2>
                <div className="space-y-4">
                  {[
                    { q: t('details.faq.q1'), a: t('details.faq.a1') },
                    { q: t('details.faq.q2'), a: t('details.faq.a2') },
                    { q: t('details.faq.q3'), a: t('details.faq.a3') }
                  ].map((faq, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-100 hover:border-primary/30 transition-all">
                      <h4 className="font-bold text-slate-900 mb-2">{faq.q}</h4>
                      <p className="text-sm text-slate-500">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Donation Box */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-4xl font-black text-primary">৳{campaign.raisedAmount.toLocaleString('bn-BD')}</span>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('details.raised.of')} ৳{campaign.targetAmount.toLocaleString('bn-BD')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-slate-900">{Math.round(progress).toLocaleString('bn-BD')}%</span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full bg-primary"
                    />
                  </div>

                  <div className="flex justify-between text-sm font-bold">
                    <div className="flex items-center text-slate-600">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      {campaign.donorCount.toLocaleString('bn-BD')} {t('details.donors')}
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      ১২ {t('details.left')}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl hover:bg-primary-light transition-all shadow-xl shadow-primary/20 active:scale-[0.98]"
                >
                  {t('campaign.donate')}
                </button>

                <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>{t('details.safe')}</span>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('details.organizer')}</p>
                      <p className="font-bold text-slate-900">{t('details.organizer.name')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Button */}
              <button className="w-full flex items-center justify-center space-x-2 text-slate-400 hover:text-red-500 transition-colors py-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">{t('details.report')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg"
        >
          {t('campaign.donate')}
        </button>
      </div>

      <DonationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        campaignTitle={language === 'en' ? campaign.title : campaign.titleBn}
        campaignId={campaign.id}
      />
    </div>
  );
}
