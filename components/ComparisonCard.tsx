import React, { useMemo } from 'react';
import { Expense } from '../types';
import { startOfMonth, endOfMonth, subMonths, isSameMonth, parseISO } from 'date-fns';
import { TrendingDown, TrendingUp, AlertCircle, ThumbsUp } from 'lucide-react';

interface ComparisonCardProps {
  expenses: Expense[];
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ expenses }) => {
  const { currentMonthTotal, lastMonthTotal, difference, isIncrease } = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    
    const currentMonthExpenses = expenses.filter(e => 
      isSameMonth(parseISO(e.date), now)
    );
    
    const lastMonthExpenses = expenses.filter(e => 
      isSameMonth(parseISO(e.date), lastMonthStart)
    );

    const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    return {
      currentMonthTotal: currentTotal,
      lastMonthTotal: lastTotal,
      difference: Math.abs(currentTotal - lastTotal),
      isIncrease: currentTotal > lastTotal
    };
  }, [expenses]);

  if (expenses.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
      <h2 className="text-gray-500 text-sm font-medium mb-4">月次レポート</h2>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-2xl font-bold text-navy-900">
            ¥{currentMonthTotal.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">今月の支出</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-600">
            先月: ¥{lastMonthTotal.toLocaleString()}
          </p>
          <div className={`flex items-center justify-end gap-1 text-sm mt-1 ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
            {isIncrease ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>
              {isIncrease ? '+' : '-'}{difference.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className={`rounded-xl p-3 flex items-start gap-3 ${isIncrease ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
        <div className="mt-0.5">
          {isIncrease ? <AlertCircle className="w-5 h-5" /> : <ThumbsUp className="w-5 h-5" />}
        </div>
        <div className="text-sm">
          <p className="font-bold mb-1">
            {isIncrease ? '使いすぎ注意！' : 'ナイス節約！'}
          </p>
          <p className="leading-relaxed opacity-90">
            {isIncrease 
              ? `先月より ¥${difference.toLocaleString()} 増えています。無駄遣いを見直して、少し出費を抑えてみましょう。`
              : `先月より ¥${difference.toLocaleString()} 減っています！この調子で節約を続けましょう。`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonCard;
