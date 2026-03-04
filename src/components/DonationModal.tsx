import { useLanguage } from '../hooks/useLanguage';
import { X, CheckCircle2, Download, Send, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, FormEvent, useEffect } from 'react';
import { donationService, paymentService, PaymentMethodConfig } from '../services/firebaseService';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  campaignId?: string;
}

type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'ssl' | 'bank';

export default function DonationModal({ isOpen, onClose, campaignTitle, campaignId }: DonationModalProps) {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [amount, setAmount] = useState('500');
  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [txId, setTxId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedTxId, setGeneratedTxId] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);

  const personalNumber = "01889411602";

  useEffect(() => {
    if (isOpen) {
      paymentService.getPaymentMethods().then(setPaymentMethods);
    }
  }, [isOpen]);

  const handleDonate = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const finalTxId = txId || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setGeneratedTxId(finalTxId);

      await donationService.submitDonation({
        campaignId: campaignId || 'general',
        campaignTitle,
        amount: Number(amount),
        method,
        donorName: isAnonymous ? 'Anonymous' : donorName,
        donorPhone,
        txId: finalTxId,
        message,
        isAnonymous
      });
      
      setStep('success');
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert("দুঃখিত, ডোনেশন জমা দেওয়া সম্ভব হয়নি। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t('donate.modal.title')}</h2>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{campaignTitle}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              {step === 'form' ? (
                <form onSubmit={handleDonate} className="space-y-6">
                  {/* Payment Instructions */}
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl space-y-2">
                    <h3 className="text-sm font-bold text-primary flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {t('donate.how')}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t('donate.how.desc').replace('{method}', method.toUpperCase())}
                    </p>
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-primary/10">
                      <span className="text-lg font-black text-slate-900 tracking-wider">{personalNumber}</span>
                      <button 
                        type="button"
                        onClick={() => navigator.clipboard.writeText(personalNumber)}
                        className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded-md"
                      >
                        {t('donate.how.copy')}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      {t('donate.how.note')}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">{t('donate.amount')}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['100', '500', '1000', '5000'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val)}
                          className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                            amount === val ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          ৳{val}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition-all font-bold"
                        placeholder={t('donate.amount.other')}
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">{t('donate.method')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setMethod(pm.id as PaymentMethod)}
                          className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-1 ${
                            method === pm.id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <img src={pm.icon} alt={pm.name} className="h-8 object-contain" referrerPolicy="no-referrer" />
                          <span className="text-[10px] font-bold text-slate-600">{pm.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                      <label htmlFor="anonymous" className="text-sm text-slate-600 font-medium cursor-pointer">
                        {t('donate.anonymous')}
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {!isAnonymous && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('donate.name')}</label>
                          <input
                            type="text"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition-all text-sm"
                            placeholder={t('donate.name.placeholder')}
                            required={!isAnonymous}
                          />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('donate.phone')}</label>
                        <input
                          type="tel"
                          value={donorPhone}
                          onChange={(e) => setDonorPhone(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition-all text-sm"
                          placeholder={t('donate.phone.placeholder')}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('donate.txid.label')}</label>
                      <input
                        type="text"
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition-all text-sm"
                        placeholder={t('donate.txid.placeholder')}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('donate.message')}</label>
                      <textarea
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition-all text-sm resize-none"
                        placeholder={t('donate.message.placeholder')}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary-light transition-all shadow-lg hover:shadow-primary/20 active:scale-[0.98] flex items-center justify-center disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      t('donate.confirm')
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8 space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{t('donate.success')}</h3>
                    <p className="text-slate-500 mt-2">{t('donate.success.desc').replace('{amount}', amount)}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('donate.txid')}</span>
                      <span className="font-mono font-bold text-slate-900">{generatedTxId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('donate.date')}</span>
                      <span className="font-bold text-slate-900">{new Date().toLocaleDateString('bn-BD')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
                      <Download className="w-4 h-4" />
                      <span>{t('donate.receipt')}</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-light transition-all">
                      <Send className="w-4 h-4" />
                      <span>{t('donate.share')}</span>
                    </button>
                  </div>

                  <button
                    onClick={onClose}
                    className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
                  >
                    {t('donate.close')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
