import React from 'react';
import Calendar from 'react-calendar';
import { Expense } from '../types';
import { parseISO, format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import 'react-calendar/dist/Calendar.css';

interface CalendarViewProps {
    expenses: Expense[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ expenses }) => {
    // 日付ごとの合計を計算
    const getDailyTotal = (date: Date) => {
        return expenses
            .filter(e => isSameDay(parseISO(e.date), date))
            .reduce((sum, e) => sum + e.amount, 0);
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const total = getDailyTotal(date);
            if (total > 0) {
                return (
                    <div className="text-[10px] font-medium text-navy-800 mt-1">
                        ¥{total.toLocaleString()}
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 calendar-wrapper">
            <style>{`
        .calendar-wrapper .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        .calendar-wrapper .react-calendar__navigation button {
          font-weight: bold;
          font-size: 1rem;
        }
        .calendar-wrapper .react-calendar__month-view__weekdays {
          font-size: 0.8rem;
          font-weight: bold;
          text-decoration: none;
          color: #9ca3af;
        }
        .calendar-wrapper .react-calendar__tile {
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: start;
          padding-top: 10px;
          font-size: 0.9rem;
        }
        .calendar-wrapper .react-calendar__tile--now {
          background: #fff8e1;
          color: #ffb300;
        }
        .calendar-wrapper .react-calendar__tile--active {
          background: #1a237e !important;
          color: white !important;
        }
        .calendar-wrapper .react-calendar__tile--active .text-navy-800 {
          color: white !important;
        }
      `}</style>
            <Calendar
                locale="ja-JP" // ブラウザによっては ja-JP が効かない場合があるため
                formatDay={(locale, date) => format(date, 'd')}
                tileContent={tileContent}
                next2Label={null}
                prev2Label={null}
            />
        </div>
    );
};

export default CalendarView;
