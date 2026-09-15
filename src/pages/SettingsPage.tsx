import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { useMutation } from '@tanstack/react-query';
import { Settings, Globe, Calendar, CheckCircle2, User, Clock } from 'lucide-react';

const WEEKDAYS = [
  { id: 1, label: 'Monday', short: 'Mon' },
  { id: 2, label: 'Tuesday', short: 'Tue' },
  { id: 3, label: 'Wednesday', short: 'Wed' },
  { id: 4, label: 'Thursday', short: 'Thu' },
  { id: 5, label: 'Friday', short: 'Fri' },
  { id: 6, label: 'Saturday', short: 'Sat' },
  { id: 7, label: 'Sunday', short: 'Sun' },
];

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata');
  const [workingDays, setWorkingDays] = useState<number[]>(user?.workingDays || [1, 2, 3, 4, 5]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setTimezone(user.timezone || 'Asia/Kolkata');
      setWorkingDays(user.workingDays || [1, 2, 3, 4, 5]);
    }
  }, [user]);

  const toggleDay = (dayId: number) => {
    if (workingDays.includes(dayId)) {
      if (workingDays.length === 1) {
        alert('You must have at least one working day configured.');
        return;
      }
      setWorkingDays(workingDays.filter((d) => d !== dayId));
    } else {
      setWorkingDays([...workingDays, dayId].sort());
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      return apiClient.patch('/users/settings', {
        name,
        timezone,
        workingDays,
      });
    },
    onSuccess: (data: any) => {
      updateUser({ name, timezone, workingDays });
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3500);
    },
  });

  return (
    <div className="max-w-3xl space-y-6 font-mono">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-l1">User &amp; Working Days Settings</h1>
        <p className="text-xs text-text-l5 mt-1">
          Configure your working days, timezone, and execution rules for WhatsApp automatic message scheduling
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-semanticLight-green border border-semantic-green/30 text-semanticDark-green text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-semantic-green shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="p-6 bg-background-white rounded-2xl border border-border-light shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text-l1 flex items-center gap-2">
          <User className="w-4 h-4 text-text-l6" />
          <span>Profile Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-l3 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green text-text-l2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-l3 mb-1">Email (Read Only)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2 text-sm bg-background-light border border-border-light rounded-xl text-text-l6 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Timezone Section */}
      <div className="p-6 bg-background-white rounded-2xl border border-border-light shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text-l1 flex items-center gap-2">
          <Globe className="w-4 h-4 text-text-l6" />
          <span>Timezone Configuration</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-text-l3 mb-1">
            Default Scheduling Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green text-text-l2"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
            <option value="America/New_York">America/New_York (EST - UTC-05:00)</option>
            <option value="Europe/London">Europe/London (GMT - UTC+00:00)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
            <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+08:00)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST - UTC-08:00)</option>
            <option value="UTC">UTC (UTC+00:00)</option>
          </select>
          <p className="text-[11px] text-text-l6 mt-1">
            Scheduled messages will execute accurately according to this local timezone.
          </p>
        </div>
      </div>

      {/* Working Days Section */}
      <div className="p-6 bg-background-white rounded-2xl border border-border-light shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-l1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-text-l6" />
            <span>Configured Working Days</span>
          </h3>
          <span className="text-xs text-text-l5">
            {workingDays.length} working days selected
          </span>
        </div>

        <p className="text-xs text-text-l5">
          Select your organization's working days. Messages scheduled on unselected days will follow your weekend / non-working day rule (e.g. Move to next working day).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-2">
          {WEEKDAYS.map((day) => {
            const isSelected = workingDays.includes(day.id);
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                className={`py-3 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'border-semantic-green bg-semanticLight-green text-semanticDark-green font-bold shadow-sm'
                    : 'border-border-light bg-background-white text-text-l6 hover:bg-background-light'
                }`}
              >
                <span className="text-xs">{day.short}</span>
                <span className="text-[10px] font-normal">
                  {isSelected ? 'Working' : 'Off'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-6 py-2.5 bg-semantic-green hover:bg-semanticDark-green text-background-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving Settings...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};
