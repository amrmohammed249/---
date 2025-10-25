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
                            للحصول على النسخة الكاملة والاستمرار في استخدام النظام، يرجى ترك معلومات التواصل الخاصة بك وسنتصل بك.
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
    const remainingSeconds = timeString.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
    const isWarning = remainingSeconds <= 10 * 60; // Under 10 minutes

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
    const [isTrialExpired, setTrialExpired] = useState(false);
    const [timeLeftString, setTimeLeftString] = useState('');

    useEffect(() => {
        document.body.style.paddingTop = '32px';

        let startTimeStr = localStorage.getItem(TRIAL_START_TIME_KEY);
        let startTime: number;

        if (startTimeStr) {
            startTime = parseInt(startTimeStr, 10);
        } else {
            startTime = Date.now();
            localStorage.setItem(TRIAL_START_TIME_KEY, startTime.toString());
        }

        const intervalId = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime >= TRIAL_DURATION_MS) {
                setTrialExpired(true);
                setTimeLeftString('00:00:00');
                document.body.style.paddingTop = '0px';
                clearInterval(intervalId);
            } else {
                const remainingMs = TRIAL_DURATION_MS - elapsedTime;
                const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
                const minutes = Math.floor((remainingMs / (1000 * 60)) % 60).toString().padStart(2, '0');
                const seconds = Math.floor((remainingMs / 1000) % 60).toString().padStart(2, '0');
                setTimeLeftString(`${hours}:${minutes}:${seconds}`);
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
            document.body.style.paddingTop = '0px';
        };
    }, []);

    if (isTrialExpired) {
        return (
            <>
                <TrialExpiredOverlay />
                <div style={{ filter: 'blur(8px)', pointerEvents: 'none', height: '100vh', overflow: 'hidden' }}>
                    {children}
                </div>
            </>
        );
    }

    return (
        <>
            {timeLeftString && <TrialCountdownBanner timeString={timeLeftString} />}
            {children}
        </>
    );
};