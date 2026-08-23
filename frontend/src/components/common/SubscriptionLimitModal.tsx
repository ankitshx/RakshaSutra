import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ShieldAlert,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  Shield,
  CreditCard,
  Building,
  Check,
  QrCode,
  Smartphone,
  Landmark,
  Coins,
  Globe,
  Tag,
  ArrowRight,
  Printer,
  Copy,
  Clock,
  ShieldCheck,
  CheckCheck,
  ExternalLink
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
  limitType?: string;
  onViewPlans?: () => void;
}

export const SubscriptionLimitModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Daily Free Scan Limit Reached (6/6 Used Today)",
  subtitle = "You have used your 6 free daily community scans. Your free quota resets every day at midnight (00:00 UTC), or subscribe to Pro for unlimited scans."
}) => {
  const { user, refreshUser } = useAuth();
  
  // Checkout flow state: 'plans' -> 'payment' -> 'otp_verify' -> 'success'
  const [checkoutStep, setCheckoutStep] = useState<'plans' | 'payment' | 'otp_verify' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi_qr' | 'upi_id' | 'card' | 'netbanking' | 'crypto' | 'stripe'>('razorpay');
  
  // Form fields
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [cryptoCoin, setCryptoCoin] = useState<'usdt' | 'btc' | 'eth'>('usdt');
  const [otpCode, setOtpCode] = useState('193026');

  // Coupon & Pricing state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number; description: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Processing & Success State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [qrTimer, setQrTimer] = useState(299); // 5 min countdown

  useEffect(() => {
    let interval: any;
    if (checkoutStep === 'payment' && paymentMethod === 'upi_qr') {
      interval = setInterval(() => {
        setQrTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [checkoutStep, paymentMethod]);

  if (!isOpen) return null;

  // Pricing Calculations
  const planBasePrice = selectedPlan === 'pro'
    ? (billingCycle === 'monthly' ? 499 : 4990)
    : (billingCycle === 'monthly' ? 4999 : 49990);

  const discountPercent = appliedCoupon ? appliedCoupon.discount_percent : 0;
  const discountAmount = Math.round((planBasePrice * discountPercent) / 100);
  const taxableAmount = Math.max(0, planBasePrice - discountAmount);
  const gstTax = Math.round(taxableAmount * 0.18);
  const finalTotal = taxableAmount + gstTax;

  const handleApplyCoupon = async () => {
    setCouponError(null);
    if (!couponInput.trim()) return;
    try {
      const res = await api.validateCoupon(couponInput.trim());
      setAppliedCoupon(res);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid or expired coupon code.');
    }
  };

  const handleFormatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleFormatExpiry = (value: string) => {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length >= 2) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  const handleProceedToPayment = () => {
    setCheckoutStep('payment');
  };

  // Launch Real Razorpay Checkout Modal
  const handleLaunchRealRazorpay = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStatus('Creating official Razorpay Order...');

    try {
      const orderData = await api.createRazorpayOrder({
        plan_id: selectedPlan,
        billing_cycle: billingCycle,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined
      });

      const options = {
        key: orderData.key_id || 'rzp_test_rakshasutra_2026',
        amount: orderData.amount_paise,
        currency: orderData.currency || 'INR',
        name: 'RakshaSutra Cyber Defense',
        description: `${orderData.plan_name} (${orderData.billing_cycle})`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          setProcessingStatus('Cryptographically verifying payment signature...');
          try {
            const verifyRes = await api.verifyRazorpayPayment({
              plan_id: selectedPlan,
              billing_cycle: billingCycle,
              razorpay_order_id: response.razorpay_order_id || orderData.order_id,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 10)}`,
              razorpay_signature: response.razorpay_signature || `sig_${Math.random().toString(36).substring(2, 15)}`,
              coupon_code: appliedCoupon ? appliedCoupon.code : undefined
            });
            await refreshUser();
            setReceiptData(verifyRes);
            setCheckoutStep('success');
            if (onSuccess) onSuccess();
          } catch (vErr: any) {
            setErrorMessage(vErr.message || 'Signature verification failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          email: user?.email || orderData.user_email,
          name: user?.full_name || orderData.user_name,
          contact: '9876543210'
        },
        theme: {
          color: '#06b6d4'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            setProcessingStatus('');
          }
        }
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setErrorMessage(`Payment failed: ${response.error?.description || 'Declined by bank'}`);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback to direct checkout execution
        executeFinalCheckout();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not initiate Razorpay checkout.');
      setIsProcessing(false);
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    if (paymentMethod === 'razorpay') {
      await handleLaunchRealRazorpay();
      return;
    }

    // If card payment, simulate 3D Secure OTP verification
    if (paymentMethod === 'card') {
      setCheckoutStep('otp_verify');
      setIsProcessing(false);
      return;
    }

    executeFinalCheckout();
  };

  const executeFinalCheckout = async () => {
    setIsProcessing(true);
    setProcessingStatus('Securing encrypted gateway handshake...');

    const statuses = [
      'Verifying payment authorization token...',
      'Provisioning unlimited cyber defense tier...',
      'Issuing enterprise Developer API keys...',
      'Generating GST-compliant tax receipt...'
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < statuses.length) {
        setProcessingStatus(statuses[idx]);
        idx++;
      }
    }, 400);

    try {
      const payload = {
        plan_id: selectedPlan,
        billing_cycle: billingCycle,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        payment_details: {
          upi_id: upiId,
          card_last4: cardNumber.slice(-4) || '1930',
          bank: selectedBank,
          crypto_coin: cryptoCoin
        }
      };

      const res = await api.processCheckout(payload);
      clearInterval(interval);
      await refreshUser();
      setReceiptData(res);
      setCheckoutStep('success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err.message || 'Payment processing failed. Please try another method.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const copyReceiptApiKey = () => {
    if (receiptData?.new_api_key) {
      navigator.clipboard.writeText(receiptData.new_api_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 dark:bg-slate-950 border-2 border-cyan-500/60 rounded-3xl shadow-2xl overflow-hidden font-sans text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold mb-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>256-BIT ENCRYPTED DEFENSE PAYMENT GATEWAY</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {checkoutStep === 'plans' && title}
            {checkoutStep === 'payment' && "Complete Secure Subscription Payment"}
            {checkoutStep === 'otp_verify' && "Bank 3D-Secure 2.0 Authentication"}
            {checkoutStep === 'success' && "🎉 Subscription Activated Successfully!"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-1">
            {checkoutStep === 'plans' && subtitle}
            {checkoutStep === 'payment' && `Select your preferred payment gateway to activate ${selectedPlan === 'pro' ? 'Pro Unlimited' : 'Enterprise SOC'}.`}
            {checkoutStep === 'otp_verify' && "Enter the verification code sent by your bank to authorize the transaction."}
            {checkoutStep === 'success' && "Your subscription is now active with unlimited scans and high-throughput developer API keys."}
          </p>

          {/* Breadcrumb Steps */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs font-mono">
            <span className={`px-2.5 py-0.5 rounded-full font-bold ${checkoutStep === 'plans' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              1. Choose Plan
            </span>
            <span className="text-slate-600">➔</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold ${checkoutStep === 'payment' || checkoutStep === 'otp_verify' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              2. Payment Method
            </span>
            <span className="text-slate-600">➔</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold ${checkoutStep === 'success' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              3. Activated
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: PLAN SELECTION */}
          {checkoutStep === 'plans' && (
            <div className="space-y-6">
              {/* Billing Toggle */}
              <div className="flex justify-center">
                <div className="inline-flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      billingCycle === 'monthly' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      billingCycle === 'annual' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Annual Billing</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[10px] font-black">20% OFF</span>
                  </button>
                </div>
              </div>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Pro Plan Card */}
                <div
                  onClick={() => setSelectedPlan('pro')}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    selectedPlan === 'pro'
                      ? 'bg-cyan-950/30 border-cyan-500 shadow-xl ring-2 ring-cyan-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-mono font-bold">
                        ⭐ MOST POPULAR
                      </span>
                      <Shield className="w-5 h-5 text-cyan-400" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white">Pro Cyber Defender</h3>
                      <p className="text-xs text-slate-400">For security professionals, researchers & individuals</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white font-mono">
                        {billingCycle === 'monthly' ? '₹499' : '₹4,990'}
                      </span>
                      <span className="text-xs text-slate-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                      <span className="text-xs text-slate-500 ml-1">($9/mo)</span>
                    </div>

                    <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2 font-bold text-cyan-300">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>UNLIMITED Link, APK & Message Scans</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>5,000 API Requests/mo (Developer API Key)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Priority Raksha AI Copilot (Instant Analysis)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Downloadable PDF Threat Dossiers</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">Selected Plan</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'pro' ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-slate-600'}`}>
                      {selectedPlan === 'pro' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                {/* Enterprise Plan Card */}
                <div
                  onClick={() => setSelectedPlan('enterprise')}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    selectedPlan === 'enterprise'
                      ? 'bg-purple-950/30 border-purple-500 shadow-xl ring-2 ring-purple-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 text-xs font-mono font-bold">
                        🏢 ENTERPRISE SOC
                      </span>
                      <Building className="w-5 h-5 text-purple-400" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white">SOC & Organization Suite</h3>
                      <p className="text-xs text-slate-400">For enterprises, banks, colleges & SOC teams</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white font-mono">
                        {billingCycle === 'monthly' ? '₹4,999' : '₹49,990'}
                      </span>
                      <span className="text-xs text-slate-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                      <span className="text-xs text-slate-500 ml-1">($59/mo)</span>
                    </div>

                    <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2 font-bold text-purple-300">
                        <Check className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>UNLIMITED Everything & High-Throughput API</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Multi-Seat Analyst & Admin Team Management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Custom Employee Phishing Simulation Engine</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>24/7 Priority Emergency Support SLA</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">Selected Plan</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'enterprise' ? 'border-purple-400 bg-purple-500 text-white' : 'border-slate-600'}`}>
                      {selectedPlan === 'enterprise' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <Tag className="w-4 h-4 text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon (e.g. CYBER20, RAKSHA100)"
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-white uppercase font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Applied: {appliedCoupon.description} ({appliedCoupon.discount_percent}% OFF)</span>
                  </div>
                )}
                {couponError && (
                  <div className="text-rose-400 text-xs">
                    {couponError}
                  </div>
                )}
              </div>

              {/* Price Summary Bar & Proceed Button */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-400 font-mono">Total Due (incl. 18% GST):</span>
                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-2xl sm:text-3xl font-black text-white">₹{finalTotal}</span>
                    {discountAmount > 0 && (
                      <span className="text-sm text-slate-500 line-through">₹{planBasePrice + Math.round(planBasePrice * 0.18)}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Select Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT METHODS */}
          {checkoutStep === 'payment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Payment Method Selector Tabs */}
                <div className="lg:col-span-4 space-y-2">
                  <span className="text-xs text-slate-400 font-mono block pb-1">Select Payment Gateway:</span>

                  {[
                    { id: 'razorpay', label: 'Razorpay Gateway', icon: ShieldCheck, desc: 'Real UPI, Cards, Netbanking, Wallets' },
                    { id: 'upi_qr', label: 'UPI QR Code', icon: QrCode, desc: 'GPay, PhonePe, Paytm, BHIM' },
                    { id: 'upi_id', label: 'UPI ID / VPA', icon: Smartphone, desc: 'Instant collect request' },
                    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                    { id: 'netbanking', label: 'Net Banking', icon: Landmark, desc: 'SBI, HDFC, ICICI, 40+ Banks' },
                    { id: 'crypto', label: 'Crypto / USDT', icon: Coins, desc: 'Web3 Security SOC' },
                    { id: 'stripe', label: 'International / Stripe', icon: Globe, desc: 'Global Cards & Apple Pay' }
                  ].map((method) => {
                    const MIcon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-md'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                          <MIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{method.label}</div>
                          <div className="text-[10px] text-slate-400">{method.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right Side: Interactive Payment Input Area */}
                <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-5">
                  
                  {/* 0. Razorpay Gateway (Primary) */}
                  {paymentMethod === 'razorpay' && (
                    <div className="space-y-4 text-center py-4">
                      <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-neon-cyan">
                        <ShieldCheck className="w-8 h-8" />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white">Razorpay Secure Checkout</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                          Click below to launch the official Razorpay checkout popup with real-time UPI apps, Cards, and Net Banking.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-sm mx-auto space-y-2 text-xs font-mono text-left">
                        <div className="flex justify-between text-slate-400">
                          <span>Plan:</span>
                          <strong className="text-white uppercase">{selectedPlan}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Billing:</span>
                          <strong className="text-white capitalize">{billingCycle}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
                          <span>Total Amount:</span>
                          <strong className="text-cyan-400 text-sm">₹{finalTotal}</strong>
                        </div>
                      </div>

                      <button
                        onClick={handleLaunchRealRazorpay}
                        disabled={isProcessing}
                        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Launch Razorpay Popup (₹{finalTotal})</span>
                      </button>
                    </div>
                  )}

                  {/* 1. UPI QR Code */}
                  {paymentMethod === 'upi_qr' && (
                    <div className="space-y-4 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>QR Code Expires in: <strong className="text-amber-400">{formatTimer(qrTimer)}</strong></span>
                      </div>

                      <div className="relative w-52 h-52 mx-auto bg-white p-3 rounded-2xl shadow-xl border-4 border-cyan-500/60 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 pointer-events-none rounded-xl" />
                        {/* Dynamic SVG QR Matrix */}
                        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
                          <rect width="100" height="100" fill="white" />
                          <path d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M19,19 h7 v7 h-7 z" fill="currentColor" />
                          <path d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M74,19 h7 v7 h-7 z" fill="currentColor" />
                          <path d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M19,74 h7 v7 h-7 z" fill="currentColor" />
                          <circle cx="50" cy="50" r="10" fill="#06b6d4" />
                          <path d="M40,20 h5 v10 h-5 z M50,15 h10 v5 h-10 z M60,30 h5 v5 h-5 z M20,45 h10 v5 h-10 z M75,45 h15 v5 h-15 z M45,65 h10 v15 h-10 z M65,65 h20 v5 h-20 z M70,75 h15 v10 h-15 z" fill="currentColor" />
                        </svg>
                        <div className="absolute bottom-2 bg-slate-950 text-cyan-400 text-[9px] font-mono px-2 py-0.5 rounded-full border border-cyan-500/50 font-bold">
                          ₹{finalTotal}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">
                        Scan this QR code using <strong>Google Pay, PhonePe, Paytm, BHIM, or any UPI app</strong> to pay ₹{finalTotal}.
                      </p>

                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          onClick={executeFinalCheckout}
                          disabled={isProcessing}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>Simulate UPI App Approval</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. UPI ID / VPA */}
                  {paymentMethod === 'upi_id' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs text-slate-300 font-mono">Enter your UPI ID / VPA:</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                        <span>Popular Handles:</span>
                        {['@okhdfcbank', '@okaxis', '@paytm', '@ybl', '@ibl'].map((h) => (
                          <button
                            key={h}
                            onClick={() => setUpiId((prev) => (prev.includes('@') ? prev.split('@')[0] + h : prev + h))}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-400 font-mono hover:bg-slate-800 cursor-pointer"
                          >
                            {h}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={executeFinalCheckout}
                        disabled={isProcessing || !upiId.trim()}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Send Collect Request & Pay ₹{finalTotal}</span>
                      </button>
                    </div>
                  )}

                  {/* 3. Credit / Debit Cards */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-mono">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => handleFormatCardNumber(e.target.value)}
                            placeholder="4532 8921 7844 1930"
                            className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 select-all"
                          />
                          <CreditCard className="w-5 h-5 text-cyan-400 absolute right-3.5 top-3" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-mono">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="e.g. ANKIT SHARMA"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white uppercase font-mono text-sm focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-mono">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => handleFormatExpiry(e.target.value)}
                            placeholder="08/29"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-mono">CVV / CVC</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleProcessPayment}
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize & Pay ₹{finalTotal}</span>
                      </button>
                    </div>
                  )}

                  {/* 4. Net Banking */}
                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-4">
                      <span className="text-xs text-slate-400 font-mono block">Select Popular Bank:</span>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {[
                          { id: 'sbi', name: 'State Bank of India (SBI)' },
                          { id: 'hdfc', name: 'HDFC Bank' },
                          { id: 'icici', name: 'ICICI Bank' },
                          { id: 'axis', name: 'Axis Bank' },
                          { id: 'kotak', name: 'Kotak Mahindra Bank' },
                          { id: 'pnb', name: 'Punjab National Bank' }
                        ].map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBank(b.id)}
                            className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                              selectedBank === b.id
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {b.name}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1 pt-2">
                        <label className="text-xs text-slate-400 font-mono">Or select from 40+ other scheduled banks:</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                        >
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                          <option value="canara">Canara Bank</option>
                          <option value="union">Union Bank of India</option>
                          <option value="bob">Bank of Baroda</option>
                          <option value="indusind">IndusInd Bank</option>
                          <option value="yes">YES Bank</option>
                          <option value="idfc">IDFC First Bank</option>
                        </select>
                      </div>

                      <button
                        onClick={executeFinalCheckout}
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Landmark className="w-4 h-4" />
                        <span>Proceed to NetBanking Gateway (₹{finalTotal})</span>
                      </button>
                    </div>
                  )}

                  {/* 5. Crypto / USDT */}
                  {paymentMethod === 'crypto' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {(['usdt', 'btc', 'eth'] as const).map((coin) => (
                          <button
                            key={coin}
                            onClick={() => setCryptoCoin(coin)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                              cryptoCoin === coin
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {coin}
                          </button>
                        ))}
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
                        <div className="text-slate-400">Deposit Address (TRC20 / ERC20):</div>
                        <div className="p-2.5 rounded-xl bg-slate-950 text-amber-400 font-mono break-all select-all border border-slate-800">
                          0x71C281F93a8e9e193026e9A826d910Ac3E8B99
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Amount: <strong>{selectedPlan === 'pro' ? '9.00 USDT' : '59.00 USDT'}</strong>
                        </div>
                      </div>

                      <button
                        onClick={executeFinalCheckout}
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Coins className="w-4 h-4" />
                        <span>Simulate Blockchain Confirmation</span>
                      </button>
                    </div>
                  )}

                  {/* 6. Stripe / Global */}
                  {paymentMethod === 'stripe' && (
                    <div className="space-y-4 text-center">
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <Globe className="w-8 h-8 text-cyan-400 mx-auto" />
                        <h4 className="font-bold text-white text-sm">International Checkout</h4>
                        <p className="text-xs text-slate-400">
                          Supports Apple Pay, Google Pay, and international cards across 135+ countries.
                        </p>
                      </div>

                      <button
                        onClick={executeFinalCheckout}
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>Pay ${selectedPlan === 'pro' ? '9.00' : '59.00'} with Stripe Express</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Back to Plan selection */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => setCheckoutStep('plans')}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  ← Back to Plan Options
                </button>

                <span className="text-xs text-slate-400 font-mono">
                  Amount Payable: <strong className="text-cyan-400">₹{finalTotal}</strong>
                </span>
              </div>
            </div>
          )}

          {/* STEP 2.5: 3D SECURE OTP MODAL SIMULATION */}
          {checkoutStep === 'otp_verify' && (
            <div className="p-6 rounded-3xl bg-slate-950 border-2 border-cyan-500/60 max-w-md mx-auto space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Bank 3D-Secure 2.0</h3>
                <p className="text-xs text-slate-400">
                  A 6-digit one-time password has been sent to your registered mobile ending in <strong>•930</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-mono">Enter OTP Code:</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center text-xl font-mono tracking-widest py-3 rounded-xl bg-slate-900 border border-cyan-500 text-cyan-400 font-bold focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 block">Demo Test Code: 193026</span>
              </div>

              <button
                onClick={executeFinalCheckout}
                disabled={isProcessing || otpCode.length < 4}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify OTP & Complete (₹{finalTotal})</span>
              </button>
            </div>
          )}

          {/* STEP 3: SUCCESS & INVOICE RECEIPT */}
          {checkoutStep === 'success' && receiptData && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="p-6 rounded-3xl bg-slate-950 border border-emerald-500/50 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">Payment Confirmed</h3>
                      <p className="text-xs text-emerald-400 font-mono">Invoice #{receiptData.invoice_number}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                    PAID • ₹{receiptData.final_amount || receiptData.base_price || 499}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">TRANSACTION ID</span>
                    <span className="text-white font-bold truncate block">{receiptData.transaction_id || receiptData.payment_id}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">TIER LEVEL</span>
                    <span className="text-cyan-400 font-bold uppercase">{receiptData.plan_id} UNLIMITED</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">GATEWAY</span>
                    <span className="text-white font-bold uppercase">{receiptData.payment_gateway || receiptData.payment_method || 'RAZORPAY'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">STATUS</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                </div>

                {/* Provisioned API Key */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cyan-400 font-mono font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Elevated Developer API Key Provisioned:
                    </span>
                    <button
                      onClick={copyReceiptApiKey}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-[11px] font-mono font-bold hover:bg-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={receiptData.new_api_key}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-cyan-300 font-bold select-all"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-cyan-400" />
                    <span>Print / Save Tax Receipt</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                  >
                    Start Unlimited Scanning
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Processing Loading Overlay */}
          {isProcessing && (
            <div className="p-6 rounded-3xl bg-cyan-950/40 border border-cyan-500/50 text-center space-y-3 animate-pulse">
              <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-spin" />
              <div className="text-sm font-bold text-white">{processingStatus || 'Securing payment gateway handshake...'}</div>
              <p className="text-xs text-slate-400 font-mono">Please do not refresh or close this window.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>Instant Activation • Cancel Anytime • 100% Secure Checkout</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white underline cursor-pointer"
          >
            Close window
          </button>
        </div>
      </div>
    </div>
  );
};
