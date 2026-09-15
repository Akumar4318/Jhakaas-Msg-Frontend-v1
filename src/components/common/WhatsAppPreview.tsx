import React from 'react';
import { MessageSquare, CheckCheck, User as UserIcon } from 'lucide-react';
import { formatTimeOnly } from '../../utils/date.util';

interface WhatsAppPreviewProps {
  contactName?: string;
  contactPhone?: string;
  message?: string;
  scheduledTime?: string | Date;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  contactName = 'Recipient',
  contactPhone,
  message = 'Type your message above to see preview...',
  scheduledTime,
}) => {
  const timeDisplay = scheduledTime ? formatTimeOnly(scheduledTime) : '10:00 AM';

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-[#ECE5DD] flex flex-col font-sans">
      {/* WhatsApp Header Bar */}
      <div className="bg-[#075E54] text-white px-4 py-2.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-semibold">
          <UserIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate">{contactName}</div>
          <div className="text-[10px] text-emerald-100/80 truncate">
            {contactPhone || 'WhatsApp Contact'}
          </div>
        </div>
        <div className="text-[10px] bg-emerald-800/60 px-2 py-0.5 rounded text-emerald-100">
          Preview
        </div>
      </div>

      {/* WhatsApp Chat Area */}
      <div className="p-4 min-h-[140px] flex flex-col justify-end bg-repeat" style={{ backgroundImage: 'radial-gradient(#00000008 1px, transparent 1px)', backgroundSize: '12px 12px' }}>
        <div className="self-end max-w-[85%] bg-[#DCF8C6] text-slate-800 rounded-lg rounded-tr-none px-3 py-2 shadow-sm relative text-xs leading-relaxed">
          <div className="whitespace-pre-wrap break-words">
            {message || <span className="text-slate-400 italic">No message entered</span>}
          </div>
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
            <span>{timeDisplay}</span>
            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
        </div>
      </div>

      {/* WhatsApp Footer note */}
      <div className="bg-slate-100/90 text-slate-500 text-[10px] px-3 py-1.5 text-center border-t border-slate-200">
        Simulated delivery at scheduled date & time
      </div>
    </div>
  );
};
