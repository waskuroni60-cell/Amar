import { Campaign } from '../data/campaigns';
import { useLanguage } from '../hooks/useLanguage';
import { BadgeCheck, Users, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import React from 'react';

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const { language, t } = useLanguage();
  const progress = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {t(`cat.${campaign.category}`)}
          </span>
        </div>
        {campaign.verified && (
          <div className="absolute top-4 right-4">
            <div className="bg-primary/90 backdrop-blur-sm text-white p-1 rounded-full shadow-sm">
              <BadgeCheck className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center text-slate-400 text-xs mb-2 space-x-3">
          <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {campaign.location}</span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
          {language === 'en' ? campaign.title : campaign.titleBn}
        </h3>

        <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
          {language === 'en' ? campaign.description : campaign.descriptionBn}
        </p>

        {/* Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-primary">৳{campaign.raisedAmount.toLocaleString('bn-BD')}</span>
            <span className="text-slate-400">{Math.round(progress).toLocaleString('bn-BD')}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-primary"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            <span>{t('campaign.raised')}</span>
            <span>{t('campaign.target')}: ৳{campaign.targetAmount.toLocaleString('bn-BD')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <div className="flex items-center text-slate-500 text-xs">
            <Users className="w-4 h-4 mr-1" />
            <span>{campaign.donorCount.toLocaleString('bn-BD')} {t('campaign.donors')}</span>
          </div>
          <Link
            to={`/campaigns/${campaign.id}`}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
          >
            {t('campaign.donate')}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CampaignCard;
