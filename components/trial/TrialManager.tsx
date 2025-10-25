import React, { useState, useEffect, FormEvent } from 'react';
import { ClockIcon } from '../icons/ClockIcon';

// ===================================================================================
// ===================================================================================
//  ===> إعدادات البريد الإلكتروني (EmailJS) <===
//
//  يرجى استبدال القيم التالية بالمعلومات الصحيحة من حسابك على موقع EmailJS.com
//  ستجد هذه المعلومات في لوحة التحكم الخاصة بك.
//
//  - Service ID:   موجود في قسم "Email Services".
//  - Template ID:  موجود في قسم "Email Templates".
//  - Public Key:   موجود في إعدادات الحساب "Account".
//
// ===================================================================================
const EMAILJS_SERVICE_ID = 'service_t6p44dc';
const EMAILJS_TEMPLATE_ID = 'template_q018utn';
const EMAILJS_PUBLIC_KEY = 'y3KlI1WQ2xWNsnB4E';
// ===================================================================================
// ===================================================================================


// This makes the emailjs variable globally available to TypeScript
declare var emailjs: any;

const TRIAL_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const TRIAL_START_TIME_KEY = 'trialStartTime';

const TrialExpiredOverlay: React.FC = () => {
    const [contactInfo, setContactInfo] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!contactInfo.trim()) {
            setStatusMessage('يرجى إدخال معلومات التواصل.');
            return;
        }

        setIsSending(true);

        const templateParams = {
            contact_info: contactInfo,
        };
        
        // Check if emailjs is loaded before trying to send
        if (typeof emailjs !== 'undefined') {
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
                .then((response: any) => {
                    console.log('SUCCESS!', response.status, response.text);
                    setStatusMessage('شكرًا لك! تم إرسال معلوماتك بنجاح وسنتواصل معك قريبًا.');
                }, (err: any) => {
                    console.log('FAILED...', err);
                    setStatusMessage('عذرًا، حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.');
                })
                .finally(() => {
                    setIsSending(false);
                });
        } else {
            console.error('EmailJS library is not loaded.');
            setStatusMessage('خطأ في تهيئة خدمة الإرسال. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
            setIsSending(false);
        }
    };


    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4 text-white"
            dir="rtl"
            aria-modal="true"
            role="dialog"
            aria-labelledby="trial-expired-title"
        >
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center max-w-lg w-full border border-gray-600 flex flex-col items-center">
                <h2 id="trial-expired-title" className="text-3xl font-bold text-blue-400 mb-4">انتهت الفترة التجريبية</h2>
                <p className="text-lg text-gray-300 mb-6">
                    نأمل أن تكون النسخة التجريبية قد نالت إعجابك.
                </p>
                
                {statusMessage ? (
                     <p className={`mt-8 text-lg font-semibold ${statusMessage.includes('خطأ') ? 'text-red-400' : 'text-green-400'}`}>
                        {statusMessage}
                    </p>
                ) : (
                    <>
                        <p className="text-gray-300">
                            للحصول على النسخة الكاملة والاستمرار في استخدام النظام، يرجى ترك معلومات التواصل الخاصة بك وسيتم التواصل معك عن طريق فريق عمل عمرو غباشي
                        </p>
                        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-sm">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="رقم هاتفك أو بريدك الإلكتروني"
                                    aria-label="رقم الهاتف أو البريد الإلكتروني للتواصل"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                    className="w-full bg-gray-700 text-white text-center text-lg p-4 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition placeholder-gray-400"
                                    disabled={isSending}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white font-bold px-6 py-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-400 disabled:cursor-wait"
                                    disabled={isSending}
                                >
                                    {isSending ? 'جاري الإرسال...' : 'إرسال'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

const TrialCountdownBanner: React.FC<{ timeString: string }> = ({ timeString }) => {
    // A simple calculation to turn red in the last minute
    const remainingSeconds = parseInt(timeString.split(':')[0], 10) * 60 + parseInt(timeString.split(':')[1], 10);
    const isWarning = remainingSeconds <= 60;

    return (
        <div
            className={`fixed top-0 left-0 right-0 h-8 z-[9998] flex items-center justify-center px-4 text-white text-sm font-semibold transition-colors ${isWarning ? 'bg-red-600' : 'bg-blue-600'}`}
            dir="rtl"
        >
            <ClockIcon className="w-5 h-5 ml-2 animate-pulse" />
            <span>نسخة تجريبية - الوقت المتبقي: {timeString}</span>
        </div>
    );
};

export const TrialWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDevMode, setIsDevMode] = useState(false);
    const [remainingTime, setRemainingTime] = useState(TRIAL_DURATION_MS);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        // Check for dev mode flag in URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('dev') === 'true') {
            setIsDevMode(true);
            console.log("Developer mode enabled, trial period bypassed.");
            return; // Exit effect if in dev mode
        }

        // Standard trial logic
        let startTime = localStorage.getItem(TRIAL_START_TIME_KEY);
        if (!startTime) {
            startTime = Date.now().toString();
            localStorage.setItem(TRIAL_START_TIME_KEY, startTime);
        }

        const interval = setInterval(() => {
            const elapsed = Date.now() - parseInt(startTime!, 10);
            const left = TRIAL_DURATION_MS - elapsed;
            if (left <= 0) {
                setRemainingTime(0);
                setIsExpired(true);
                clearInterval(interval);
            } else {
                setRemainingTime(left);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    
    // If in dev mode, bypass all trial logic and render the app directly.
    if (isDevMode) {
        return <>{children}</>;
    }
    
    if (isExpired) {
        return <TrialExpiredOverlay />;
    }

    return (
        <>
            <TrialCountdownBanner timeString={formatTime(remainingTime)} />
            <div style={{ paddingTop: '2rem' }}> {/* Offset for the banner */}
                {children}
            </div>
        </>
    );
};
