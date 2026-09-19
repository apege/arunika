'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Clock, Check } from 'lucide-react';

interface PromoDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentValue: string;
  onSave: (val: string) => void;
}

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function PromoDatePickerModal({
  isOpen,
  onClose,
  currentValue,
  onSave,
}: PromoDatePickerModalProps) {
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<number>(23);
  const [selectedMinute, setSelectedMinute] = useState<number>(59);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Parse currentValue if valid, or default to 7 days ahead
  useEffect(() => {
    if (!isOpen) return;

    const now = new Date();
    let initDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    let initHour = 23;
    let initMin = 59;

    if (currentValue) {
      // Format example: "30 September 2026 • 23:59 WIB" or "1 Oktober 2026 • 06:59 WIB"
      const match = currentValue.match(/(\d+)\s+([A-Za-z]+)\s+(\d{4})\s*•?\s*(\d{1,2})?:?(\d{1,2})?/);
      if (match) {
        const day = parseInt(match[1], 10);
        const monthName = match[2];
        const year = parseInt(match[3], 10);
        const monthIdx = MONTH_NAMES_ID.findIndex(
          (m) => m.toLowerCase() === monthName.toLowerCase()
        );

        if (monthIdx !== -1 && !isNaN(day) && !isNaN(year)) {
          initDate = new Date(year, monthIdx, day);
        }
        if (match[4]) initHour = parseInt(match[4], 10);
        if (match[5]) initMin = parseInt(match[5], 10);
      }
    }

    setSelectedDate(initDate);
    setViewDate(new Date(initDate.getFullYear(), initDate.getMonth(), 1));
    setSelectedHour(initHour);
    setSelectedMinute(initMin);
    setActivePreset(null);
  }, [isOpen, currentValue]);

  if (!isOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // First day of month & total days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Calendar cells
  const prevMonthDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push(i);
  }

  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDays = [];
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthDays.push(i);
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
    setActivePreset(null);
  };

  const handlePreset = (type: string) => {
    const now = new Date();
    let target = new Date();
    if (type === '+3hari') {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);
    } else if (type === '+7hari') {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    } else if (type === '+14hari') {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14);
    } else if (type === 'akhirbulan') {
      target = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    setSelectedDate(target);
    setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
    setActivePreset(type);
  };

  const handleApply = () => {
    const d = selectedDate.getDate();
    const m = MONTH_NAMES_ID[selectedDate.getMonth()];
    const y = selectedDate.getFullYear();
    const hh = String(selectedHour).padStart(2, '0');
    const mm = String(selectedMinute).padStart(2, '0');

    const formatted = `${d} ${m} ${y} • ${hh}:${mm} WIB`;
    onSave(formatted);
    onClose();
  };

  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden transition-all text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Presets & Close button */}
        <div className="flex items-center justify-between gap-1.5 pb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handlePreset('+3hari')}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                activePreset === '+3hari'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 hover:bg-pink-100'
              }`}
            >
              +3 Hari
            </button>
            <button
              type="button"
              onClick={() => handlePreset('+7hari')}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                activePreset === '+7hari'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 hover:bg-pink-100'
              }`}
            >
              +7 Hari
            </button>
            <button
              type="button"
              onClick={() => handlePreset('+14hari')}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                activePreset === '+14hari'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 hover:bg-pink-100'
              }`}
            >
              +14 Hari
            </button>
            <button
              type="button"
              onClick={() => handlePreset('akhirbulan')}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                activePreset === 'akhirbulan'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 hover:bg-pink-100'
              }`}
            >
              Akhir Bulan
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Header & Prev/Next Arrows */}
        <div className="flex items-center justify-between pt-1 pb-3">
          <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {MONTH_NAMES_ID[month]} {year}
          </h3>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:border-pink-300 text-slate-500 dark:text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:border-pink-300 text-slate-500 dark:text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-black pb-2">
          {DAY_NAMES_ID.map((day, idx) => (
            <span
              key={idx}
              className={idx === 0 ? 'text-pink-600 dark:text-pink-400' : 'text-slate-400'}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm font-bold pb-4">
          {/* Previous Month Days */}
          {prevMonthDays.map((d, i) => (
            <div
              key={`prev-${i}`}
              className="h-9 flex items-center justify-center text-slate-300 dark:text-slate-700"
            >
              {d}
            </div>
          ))}

          {/* Current Month Days */}
          {currentMonthDays.map((d) => {
            const active = isSelected(d);
            return (
              <button
                key={`curr-${d}`}
                type="button"
                onClick={() => handleSelectDay(d)}
                className={`h-9 rounded-2xl flex items-center justify-center font-black transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 scale-105'
                    : 'hover:bg-pink-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                {d}
              </button>
            );
          })}

          {/* Next Month Days */}
          {nextMonthDays.map((d, i) => (
            <div
              key={`next-${i}`}
              className="h-9 flex items-center justify-center text-slate-300 dark:text-slate-700"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3">
          {/* Time Picker Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-pink-500" />
              <span>Atur Jam & Menit Berakhir</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 text-xs font-black">
              {pad(selectedHour)}:{pad(selectedMinute)} WIB
            </span>
          </div>

          {/* 2 Select Boxes: Jam & Menit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">Jam (00 - 23)</label>
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-pink-500 cursor-pointer"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option
                    key={i}
                    value={i}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {pad(i)} : 00
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">Menit (00 - 59)</label>
              <select
                value={selectedMinute}
                onChange={(e) => setSelectedMinute(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-pink-500 cursor-pointer"
              >
                {Array.from({ length: 60 }).map((_, i) => (
                  <option
                    key={i}
                    value={i}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    Menit {pad(i)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CTA Apply Button */}
        <div className="pt-5">
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-400 hover:to-rose-400 text-white font-black text-sm shadow-xl shadow-pink-500/25 transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Waktu Promo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
