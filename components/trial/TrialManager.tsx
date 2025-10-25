
import React, { useState, useEffect } from 'react';

const TRIAL_DURATION_MS = 30 * 60 * 1000; // 30 minutes
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
                    <p className="font-bold text-xl text-white">[رقم هاتفك أو بريدك الإلكتروني]</p>
                </div>
            </div>
        </div>
    );
};

export const TrialWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isTrialExpired, setTrialExpired] = useState(false);

    useEffect(() => {
        let startTimeStr = localStorage.getItem(TRIAL_START_TIME_KEY);
        let startTime: number;

        if (startTimeStr) {
            startTime = parseInt(startTimeStr, 10);
        } else {
            startTime = Date.now();
            localStorage.setItem(TRIAL_START_TIME_KEY, startTime.toString());
        }

        const checkTrialStatus = () => {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime >= TRIAL_DURATION_MS) {
                setTrialExpired(true);
                if (intervalId) {
                    clearInterval(intervalId);
                }
            }
        };

        checkTrialStatus();

        const intervalId = setInterval(checkTrialStatus, 10000);

        return () => clearInterval(intervalId);
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

    return <>{children}</>;
};
