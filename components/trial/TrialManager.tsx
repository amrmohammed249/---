import React, { useState, useEffect } from 'react';
import { ClockIcon } from '../icons/ClockIcon';

const TRIAL_DURATION_MS = 1 * 60 * 60 * 1000; // 1 hour
const TRIAL_START_TIME_KEY = 'trialStartTime';

const TrialExpiredOverlay: React.FC = () => {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4 text-white"
            dir="rtl"
            aria-modal="true"
            role="dialog"
            aria-labelledby="trial-expired-title"
        >
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center max-w-lg border border-gray-600">
                <h2 id="trial-expired-title" className="text-3xl font-bold text-blue-400 mb-4">انتهت الفترة التجريبية</h2>
                <p className="text-lg text-gray-300 mb-6">
                    نأمل أن تكون النسخة التجريبية قد نالت إعجابك.
                </p>
                <p className="text-gray-300">
                    للحصول على النسخة الكاملة والاستمرار في استخدام النظام، يرجى التواصل معنا.
                </p>
                <div className="mt-6 p-4 bg-gray-700 rounded-md">
                    <p className="font-bold text-xl text-white">[ضع رقم هاتفك أو بريدك الإلكتروني هنا]</p>
                </div>
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
