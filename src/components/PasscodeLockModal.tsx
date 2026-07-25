import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, Check } from 'lucide-react';

interface PasscodeLockModalProps {
  correctPasscode: string;
  onSuccess: () => void;
}

export const PasscodeLockModal: React.FC<PasscodeLockModalProps> = ({
  correctPasscode,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        if (nextPin === correctPasscode) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 font-['Cairo',sans-serif]">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center text-white shadow-2xl space-y-6 animate-fade-in">
        
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black font-['Tajawal'] text-white">
            الجندي حاسب
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            أدخل رمز الحماية (PIN) المكون من 4 أرقام لفتح التطبيق
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 dir-ltr">
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-rose-500 animate-bounce'
                    : filled
                    ? 'bg-emerald-400 scale-110 shadow-md shadow-emerald-500/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-bold text-rose-400 flex items-center justify-center gap-1">
            <ShieldAlert className="w-4 h-4" />
            <span>رمز الخصوصية غير صحيح! حاول مجدداً</span>
          </p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 pt-2 dir-ltr">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold font-mono text-xl py-3.5 rounded-2xl transition border border-slate-700/60 active:scale-95"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress('0')}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold font-mono text-xl py-3.5 rounded-2xl transition border border-slate-700/60 active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs py-3.5 rounded-2xl transition border border-slate-700/40"
          >
            مسح
          </button>
        </div>

      </div>
    </div>
  );
};
