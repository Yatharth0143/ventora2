import React from 'react'
import { ShieldCheck, Info } from 'lucide-react'

export default function FitTable({ data }) {
  if (!data || !data.fit_table) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
        No fit data available yet. Run the audit first.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Deterministic Investment Fit Matrix</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Every cell is derived from verified semantic fields with explicit page citations — 0% hallucinations.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          Deterministic Rule
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Evaluation Criterion</th>
              <th className="py-3 px-4">Verified Finding Value</th>
              <th className="py-3 px-4">Deck Source Field</th>
              <th className="py-3 px-4">Citation Page</th>
              <th className="py-3 px-4">Trust Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.fit_table.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">{row.category}</td>
                <td className="py-3.5 px-4 font-semibold text-indigo-700">{row.value}</td>
                <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{row.source_field}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono font-bold text-[10px]">
                    Page {row.source_page}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{data.formula}</span>
      </div>
    </div>
  )
}

