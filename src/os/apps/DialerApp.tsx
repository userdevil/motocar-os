import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  User,
  Clock,
  Star,
  Mic,
  MicOff,
  Volume2,
  Delete,
} from 'lucide-react';
import { AudioSynth } from '../sounds/AudioSynth';

export const DialerApp: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [inCall, setInCall] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(true);
  const [activeContact, setActiveContact] = useState<string>('');

  const contacts = [
    { name: 'Sarah Connor', phone: '+1 (555) 019-2834', type: 'Mobile' },
    { name: 'Kepler Operations', phone: '+1 (555) 449-8821', type: 'Work' },
    { name: 'Tesla Service Center', phone: '+1 (555) 773-1940', type: 'Emergency' },
    { name: 'Marcus Vance', phone: '+1 (555) 321-9988', type: 'Home' },
  ];

  const handleKeyPress = (char: string) => {
    AudioSynth.playTouchFeedback();
    setPhoneNumber((prev) => prev + char);
  };

  const handleStartCall = (name?: string, num?: string) => {
    AudioSynth.playTouchFeedback();
    setActiveContact(name || 'Unknown Contact');
    setPhoneNumber(num || phoneNumber || 'Unknown');
    setInCall(true);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    AudioSynth.playTouchFeedback();
    setInCall(false);
  };

  return (
    <div className="w-full h-full p-6 bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {inCall ? (
        /* Active In-Call Screen */
        <div className="flex flex-col items-center justify-center my-auto space-y-6">
          <div className="w-24 h-24 rounded-full bg-emerald-600/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-pulse">
            <User size={48} />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-black text-white">{activeContact}</h2>
            <p className="text-sm font-mono text-slate-400 mt-1">{phoneNumber}</p>
            <div className="text-sm font-bold text-emerald-400 mt-2 font-mono">
              Call in progress • 00:24
            </div>
          </div>

          {/* In-Call Actions */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                isMuted
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-900 border border-slate-700 text-slate-300'
              }`}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                isSpeaker
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 border border-slate-700 text-slate-300'
              }`}
            >
              <Volume2 size={22} />
            </button>
            <button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/40 active:scale-95 transition"
            >
              <PhoneOff size={26} />
            </button>
          </div>
        </div>
      ) : (
        /* Dialpad & Contacts View */
        <div className="grid grid-cols-12 gap-8 h-full">
          {/* Left: Quick Contacts & Recents */}
          <div className="col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-2">
              <Star size={18} className="text-amber-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Favorite Contacts
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {contacts.map((contact, i) => (
                <div
                  key={i}
                  onClick={() => handleStartCall(contact.name, contact.phone)}
                  className="p-3 bg-slate-950/60 hover:bg-slate-800 rounded-2xl flex items-center justify-between cursor-pointer border border-slate-800/80 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold text-sm">
                      {contact.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {contact.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {contact.phone}
                      </div>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                    <Phone size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Driver-Safe Keypad */}
          <div className="col-span-6 flex flex-col justify-between items-center bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl">
            {/* Number Display & Backspace */}
            <div className="w-full flex items-center justify-between bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800">
              <span className="text-2xl font-mono font-bold text-white tracking-wider">
                {phoneNumber || 'Dial number...'}
              </span>
              {phoneNumber && (
                <button
                  onClick={() => setPhoneNumber((p) => p.slice(0, -1))}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <Delete size={20} />
                </button>
              )}
            </div>

            {/* Keypad Grid (1-9, *, 0, #) */}
            <div className="grid grid-cols-3 gap-3 w-full my-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(
                (digit) => (
                  <button
                    key={digit}
                    onClick={() => handleKeyPress(digit)}
                    className="h-12 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xl font-bold text-white flex items-center justify-center transition active:scale-95"
                  >
                    {digit}
                  </button>
                )
              )}
            </div>

            {/* Big Green Call Button */}
            <button
              onClick={() => handleStartCall(undefined, phoneNumber)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2 active:scale-95 transition"
            >
              <PhoneCall size={20} />
              <span>Call Number</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
