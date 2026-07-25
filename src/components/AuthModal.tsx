import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  X, UserCheck, Shield, Lock, Fingerprint, Mail, 
  CheckCircle2, LogOut, ArrowRight, User
} from 'lucide-react';

interface AuthModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (newUser: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ user, onClose, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'switch'>('profile');

  const demoUsers: UserProfile[] = [
    {
      id: 'usr-101',
      name: 'عبد الله العتيبي',
      email: 'a.alotaibi@haris-security.com',
      role: 'مدير أمني (Admin)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+966 50 123 4567',
      mfaEnabled: true,
      assignedSites: ['site-1', 'site-2', 'site-3'],
    },
    {
      id: 'usr-102',
      name: 'محمد الشمري',
      email: 'm.alshammari@haris-security.com',
      role: 'مشرف موقع (Operator)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+966 55 987 6543',
      mfaEnabled: false,
      assignedSites: ['site-1', 'site-2'],
    },
    {
      id: 'usr-103',
      name: 'خالد الغامدي',
      email: 'k.alghamdi@haris-security.com',
      role: 'مراقب (Viewer)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+966 54 111 2233',
      mfaEnabled: true,
      assignedSites: ['site-1'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-950 border border-sky-800 rounded-xl">
              <UserCheck className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">حساب المستخدم وصلاحيات النظام</h2>
              <p className="text-xs text-slate-400">إدارة الملف الشخصي والتبديل بين الحسابات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            الملف الشخصي
          </button>
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'switch' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            تبديل الحساب (3 أداور)
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {activeTab === 'profile' ? (
            <div className="space-y-5 text-center">
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-sky-500 shadow-xl">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-100">{user.name}</h3>
                <p className="text-xs text-sky-400 font-semibold">{user.role}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">{user.email}</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2 text-right">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">رقم الهاتف:</span>
                  <span className="font-mono text-slate-200">{user.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">المصادقة الثنائية MFA:</span>
                  <span className="text-emerald-400 font-bold">مفعلة بطلب البصمة 🔒</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">المواقع المتاح مراقبتها:</span>
                  <span className="font-bold text-slate-200">{user.assignedSites.length} مواقع</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg"
              >
                متابعة العمل في اللوحة
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">اختر حسام التجربة لتجربة الصلاحيات المختلفة:</p>

              {demoUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    onUpdateUser(u);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border text-right cursor-pointer transition-all flex items-center justify-between group ${
                    user.id === u.id
                      ? 'bg-sky-950/80 border-sky-500 text-slate-100'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                    <div>
                      <div className="font-bold text-xs text-slate-100">{u.name}</div>
                      <div className="text-[11px] text-sky-400">{u.role}</div>
                    </div>
                  </div>

                  {user.id === u.id ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      الحساب الحالي
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 group-hover:text-sky-400 font-semibold flex items-center gap-1">
                      دخول
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
