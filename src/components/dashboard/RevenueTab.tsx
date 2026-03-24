"use client";
import { Channel } from "@/types";
import BarChart from "./BarChart";

type Props = { channel: Channel };

export default function RevenueTab({ channel }: Props) {
  const revenues = channel.monthly_revenue ?? [];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const revenueData = months.map((m) => {
    const r = revenues.find((r) => r.year === 2026 && r.month === m);
    return r ? r.revenue : 0;
  });
  const labels = months.map((m) => `${m}月`);
  const total = revenueData.reduce((a, b) => a + b, 0);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-white mb-6">収益</h1>

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#252525] border border-[#303030] rounded-xl p-6 mb-6">
        <p className="text-sm text-gray-400 mb-1">2026年 累計収益</p>
        <p className="text-4xl font-bold text-[#facc15]">¥{total.toLocaleString("ja-JP")}</p>
      </div>

      {/* Chart */}
      <div className="bg-[#202020] border border-[#303030] rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-400 mb-4">月別収益グラフ</p>
        {total > 0 ? (
          <BarChart data={revenueData} labels={labels} />
        ) : (
          <p className="text-gray-600 text-sm text-center py-8">収益データがまだ登録されていません</p>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#202020] border border-[#303030] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#303030]">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">月</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">収益</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m} className="border-b border-[#252525] hover:bg-[#252525] transition-colors">
                <td className="px-4 py-3 text-gray-300">2026年 {m}月</td>
                <td className="px-4 py-3 text-right text-[#facc15] font-medium">
                  ¥{revenueData[m - 1].toLocaleString("ja-JP")}
                </td>
              </tr>
            ))}
            <tr className="bg-[#252525]">
              <td className="px-4 py-3 text-white font-semibold">合計</td>
              <td className="px-4 py-3 text-right text-[#facc15] font-bold text-base">
                ¥{total.toLocaleString("ja-JP")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
