import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Circle, RotateCcw } from 'lucide-react';

export function PharmacyCalendar() {
  const { stats } = usePharmacy();
  const today = new Date();

  // Initialize with real current date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const [tasks, setTasks] = useState([
    { id: 1, text: 'Morning Inventory Stock Check', time: '09:00 - 10:00 AM', done: true },
    { id: 2, text: 'Batch Expiry Review (FEFO)', time: '11:30 - 12:30 PM', done: false },
    { id: 3, text: 'Supplier Restock Receiving (Apex)', time: '02:00 - 03:00 PM', done: false }
  ]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const isCurrentMonthView = month === today.getMonth() && year === today.getFullYear();
  const isTodaySelected = isCurrentMonthView && selectedDay === today.getDate();

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    setCurrentDate(prev);
    if (prev.getMonth() === today.getMonth() && prev.getFullYear() === today.getFullYear()) {
      setSelectedDay(today.getDate());
    } else {
      setSelectedDay(1);
    }
  };

  const handleNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setCurrentDate(next);
    if (next.getMonth() === today.getMonth() && next.getFullYear() === today.getFullYear()) {
      setSelectedDay(today.getDate());
    } else {
      setSelectedDay(1);
    }
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(today.getDate());
  };

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const days = [];

  // Trailing previous month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      dateKey: `prev-${year}-${month}-${prevMonthTotalDays - i}`
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const isToday = isCurrentMonthView && d === today.getDate();
    days.push({
      day: d,
      isCurrentMonth: true,
      isToday,
      hasEvent: d === 8 || d === 10 || d === 15, // dates with restocks/deliveries
      dateKey: `curr-${year}-${month + 1}-${d}`
    });
  }

  // Trailing next month days to complete 35 or 42 grid
  const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
  if (remaining > 0) {
    for (let d = 1; d <= remaining; d++) {
      days.push({
        day: d,
        isCurrentMonth: false,
        dateKey: `next-${year}-${month + 2}-${d}`
      });
    }
  }

  const formattedSelectedDate = new Date(year, month, selectedDay).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-teal-100/80 shadow-[0_4px_20px_-4px_rgba(13,148,136,0.06)] flex flex-col justify-between h-full">
      {/* Calendar Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-teal-100/60 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {monthNames[month]}, {year}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Operations & Delivery Schedule</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-teal-50/70 border border-teal-200/60 p-1 rounded-xl">
            {!isCurrentMonthView && (
              <button
                onClick={handleGoToToday}
                className="px-2 py-0.5 text-[10px] font-bold rounded-lg text-teal-700 hover:bg-white transition-colors"
                title="Jump to Today"
              >
                Today
              </button>
            )}
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-600 hover:text-teal-800 hover:bg-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-600 hover:text-teal-800 hover:bg-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
          {days.map((item, idx) => {
            const isSelected = item.isCurrentMonth && selectedDay === item.day;
            const isToday = item.isToday;

            return (
              <button
                key={idx}
                onClick={() => item.isCurrentMonth && setSelectedDay(item.day)}
                disabled={!item.isCurrentMonth}
                className={`h-8 w-8 mx-auto flex flex-col items-center justify-center rounded-full transition-all relative ${
                  !item.isCurrentMonth
                    ? 'text-slate-300 cursor-default'
                    : isSelected
                      ? 'bg-[#11b3a1] text-white font-extrabold shadow-md shadow-[#11b3a1]/25 scale-105'
                      : isToday
                        ? 'bg-teal-50 text-teal-900 font-extrabold border-2 border-[#11b3a1]'
                        : 'text-slate-700 hover:bg-teal-50/80 hover:text-teal-900'
                }`}
              >
                <span>{item.day}</span>
                {isToday && !isSelected && (
                  <span className="absolute -top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#11b3a1]" />
                )}
                {item.hasEvent && !isSelected && !isToday && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#11b3a1]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Pharmacy Task Checklist */}
      <div className="pt-4 mt-3 border-t border-teal-100/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold text-slate-900">
              {isTodaySelected ? "Today's Schedule" : "Selected Day Schedule"}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60">
              {tasks.filter(t => t.done).length}/{tasks.length} Done
            </span>
          </div>
          <span className="text-[10px] text-teal-700 font-semibold">{formattedSelectedDate}</span>
        </div>

        <div className="space-y-1.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                task.done
                  ? 'bg-teal-50/50 border-teal-200/60 text-slate-500'
                  : 'bg-white border-slate-200/80 hover:border-teal-300 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {task.done ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 hover:text-teal-500 shrink-0" />
                )}
                <span className={`text-[11px] font-medium leading-none ${task.done ? 'line-through text-slate-400' : ''}`}>
                  {task.text}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{task.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
