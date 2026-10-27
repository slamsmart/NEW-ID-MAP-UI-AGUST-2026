/**
 * PolicyAnalysisPanel — Analisis Kebijakan berbasis data ID-MAP.
 *
 * Menyajikan prioritas kebijakan/program aksi nyata untuk ekosistem
 * pesisir & mangrove, diturunkan dari kondisi mangrove, ekosistem, dan
 * tekanan sosial. Export PDF hanya untuk admin & verifikator; viewer
 * dapat melihat analisis tetapi tidak dapat mengekspor.
 */
import { useMemo } from 'react';
import { Scale, ShieldAlert, Sprout, FileText } from 'lucide-react';
import type { MangroveLocation } from '../../types';
import { ekosistemData, tekananSosialData } from '../../data/seedData';
import { kebijakanData } from '../../data/kebijakan';
import {
  buildPolicyAnalysis,
  RISK_LABEL,
  type PolicyAnalysis,
  type RiskLevel,
} from '../../lib/policyAnalysis';
import DownloadDropdown from '../DownloadDropdown';

const RISK_STYLE: Record<RiskLevel, string> = {
  kritis: 'bg-red-100 text-red-800 border-red-200',
  perhatian: 'bg-amber-100 text-amber-800 border-amber-200',
  baik: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  );
}

function buildReportHtml(analysis: PolicyAnalysis): string {
  const tanggal = new Date(analysis.generatedAt).toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const rows = analysis.items.map((it, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(it.name)}<br/><small>${esc(it.district)}, ${esc(it.province)}</small></td>
      <td style="text-align:center">${RISK_LABEL[it.risiko]}</td>
      <td style="text-align:center">${it.skorKesehatan ?? '-'}</td>
      <td style="text-align:center">${it.indeksAncaman ?? '-'}</td>
      <td style="text-align:center">${it.urgensi}</td>
      <td>${it.aksiPrioritas.map((a) => `&bull; ${esc(a)}`).join('<br/>')}
        ${it.dasarHukum.length ? `<br/><small><b>Dasar hukum:</b> ${it.dasarHukum.map(esc).join('; ')}</small>` : ''}
        ${it.instansiPJ.length ? `<br/><small><b>Instansi PJ:</b> ${it.instansiPJ.map(esc).join(', ')}</small>` : ''}
        ${it.targetCapaian ? `<br/><small><b>Target:</b> ${esc(it.targetCapaian)}</small>` : ''}
      </td>
    </tr>`).join('');

  return `<!doctype html><html lang="id"><head><meta charset="utf-8" />
  <title>Analisis Kebijakan ID-MAP</title>
  <style>
    @page { size: A4 landscape; margin: 14mm; }
    body { font-family: system-ui, Arial, sans-serif; color: #0f172a; font-size: 11px; }
    h1 { font-size: 18px; margin: 0 0 2px; }
    .meta { color: #475569; font-size: 11px; margin-bottom: 12px; }
    .cards { display: flex; gap: 8px; margin-bottom: 12px; }
    .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; }
    .card b { font-size: 16px; display: block; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 6px; vertical-align: top; text-align: left; }
    th { background: #0d404f; color: #fff; font-size: 10px; text-transform: uppercase; }
    small { color: #475569; }
    .foot { margin-top: 12px; color: #64748b; font-size: 10px; }
  </style></head><body>
  <h1>Analisis Kebijakan Ekosistem Pesisir &amp; Mangrove</h1>
  <div class="meta">ID-MAP — Integrasi Data Mangrove dan Pesisir Jawa Timur · Dicetak ${tanggal}</div>
  <div class="cards">
    <div class="card">Total Lokasi <b>${analysis.summary.totalLokasi}</b></div>
    <div class="card">Kritis <b>${analysis.summary.kritis}</b></div>
    <div class="card">Perhatian <b>${analysis.summary.perhatian}</b></div>
    <div class="card">Baik <b>${analysis.summary.baik}</b></div>
    <div class="card">Rata-rata Skor <b>${analysis.summary.avgSkorKesehatan}</b></div>
    <div class="card">Tenurial Bermasalah <b>${analysis.summary.tenurialBermasalah}</b></div>
  </div>
  <table>
    <thead><tr>
      <th>#</th><th>Lokasi</th><th>Risiko</th><th>Skor</th><th>Ancaman</th><th>Urgensi</th><th>Rekomendasi Aksi Nyata</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="foot">Analisis diturunkan dari data ID-MAP (kondisi mangrove, ekosistem, tekanan sosial). Bahan pendukung keputusan; penetapan kebijakan tetap menjadi kewenangan pejabat berwenang.</p>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script>
  </body></html>`;
}

function printHtmlDocument(title: string, html: string) {
  const win = window.open('', '_blank', 'width=1000,height=800');
  if (!win) {
    alert('Popup diblokir. Izinkan popup untuk mengekspor PDF.');
    return;
  }
  win.document.open();
  win.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8" /><title>${esc(title)}</title></head><body>${html}</body></html>`);
  win.document.close();
  win.focus();
  win.setTimeout(() => win.print(), 250);
}

function exportPolicyPdf(analysis: PolicyAnalysis) {
  printHtmlDocument('Analisis Kebijakan ID-MAP', buildReportHtml(analysis));
}

function exportLocationPolicyPdf(item: PolicyAnalysis['items'][number]) {
  const actions = item.aksiPrioritas.map(action => `<li>${esc(action)}</li>`).join('');
  const laws = item.dasarHukum.map(law => `<li>${esc(law)}</li>`).join('');
  const agencies = item.instansiPJ.map(agency => `<span class="tag">${esc(agency)}</span>`).join('');

  printHtmlDocument(
    `Analisis Kebijakan - ${item.name}`,
    `<style>
      @page { size: A4; margin: 16mm; }
      body { font-family: Arial, sans-serif; color: #17212b; line-height: 1.45; font-size: 11px; margin: 0; }
      h1 { color: #0d404f; font-size: 21px; margin: 0 0 4px; }
      h2 { color: #0d404f; font-size: 13px; margin: 0 0 7px; }
      p { margin: 4px 0; }
      .header { border-bottom: 3px solid #f06424; padding-bottom: 10px; margin-bottom: 12px; }
      .muted { color: #64748b; font-size: 10px; }
      .summary { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 7px; padding: 9px; margin: 10px 0; }
      .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin: 10px 0; }
      .meta div, .box { border: 1px solid #dbe3e8; border-radius: 6px; padding: 8px; }
      .label { color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: .04em; }
      .value { font-weight: 700; margin-top: 2px; }
      .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
      ul { margin: 0; padding: 8px 8px 8px 22px; } li { margin: 3px 0; }
      .tag { display: inline-block; background: #ecfdf5; border: 1px solid #bbf7d0; color: #166534; border-radius: 3px; padding: 2px 5px; margin: 2px 3px 0 0; }
      .footer { color: #64748b; border-top: 1px solid #dbe3e8; margin-top: 14px; padding-top: 7px; font-size: 9px; }
    </style>
    <div class="header"><div class="muted">ID-MAP · ANALISIS KEBIJAKAN EKOSISTEM PESISIR</div><h1>${esc(item.name)}</h1><div class="muted">${esc(item.district)} · ${esc(item.province)} · Risiko ${esc(RISK_LABEL[item.risiko])}</div></div>
    <div class="meta">
      <div><div class="label">Skor kesehatan</div><div class="value">${item.skorKesehatan ?? '-'}/100</div></div>
      <div><div class="label">Indeks ancaman</div><div class="value">${item.indeksAncaman ?? '-'}/10</div></div>
      <div><div class="label">Urgensi</div><div class="value">${item.urgensi}/100</div></div>
      <div><div class="label">Prioritas</div><div class="value">${esc(RISK_LABEL[item.risiko])}</div></div>
    </div>
    <div class="summary"><strong>Ringkasan kebijakan</strong><p>${esc(item.ringkasan)}</p></div>
    <div class="box"><h2>Rekomendasi Aksi Nyata</h2><ul>${actions}</ul></div>
    <div class="columns">
      <section class="box"><h2>Dasar Hukum</h2><ul>${laws || '<li>-</li>'}</ul></section>
      <section class="box"><h2>Target Capaian</h2><p>${esc(item.targetCapaian || '-')}</p><h2 style="margin-top:12px">Instansi Penanggung Jawab</h2><div>${agencies || '-'}</div></section>
    </div>
    <div class="footer">Analisis diturunkan dari data ID-MAP (kondisi mangrove, ekosistem, tekanan sosial). Bahan pendukung keputusan; penetapan kebijakan tetap menjadi kewenangan pejabat berwenang.</div>`,
  );
}

interface Props {
  locations: MangroveLocation[];
  /** admin/verifikator boleh export; viewer tidak. */
  canExport: boolean;
}

export default function PolicyAnalysisPanel({ locations, canExport }: Props) {
  const analysis = useMemo(
    () => buildPolicyAnalysis(locations, ekosistemData, tekananSosialData, kebijakanData),
    [locations],
  );

  const top = analysis.items.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0d404f]/10 flex items-center justify-center">
            <Scale className="w-4 h-4 text-[#0d404f]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Analisis Kebijakan</h3>
            <p className="text-xs text-gray-500">Prioritas aksi nyata pesisir &amp; mangrove — berbasis data ID-MAP</p>
          </div>
        </div>
        {canExport ? (
          <DownloadDropdown
            buttonLabel="Export PDF"
            items={[{
              kind: 'pdf',
              label: 'Analisis Kebijakan (PDF)',
              icon: FileText,
              onSelect: () => exportPolicyPdf(analysis),
            }]}
          />
        ) : (
          <span
            className="text-[11px] text-gray-400 border border-gray-200 rounded-full px-3 py-1.5"
            title="Export PDF hanya untuk admin & verifikator"
          >
            Export PDF: admin / verifikator
          </span>
        )}
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-gray-100">
        {[
          { label: 'Total Lokasi', value: analysis.summary.totalLokasi },
          { label: 'Kritis', value: analysis.summary.kritis, tone: 'text-red-600' },
          { label: 'Perhatian', value: analysis.summary.perhatian, tone: 'text-amber-600' },
          { label: 'Baik', value: analysis.summary.baik, tone: 'text-emerald-600' },
          { label: 'Rata-rata Skor', value: analysis.summary.avgSkorKesehatan },
          { label: 'Tenurial Bermasalah', value: analysis.summary.tenurialBermasalah, tone: 'text-orange-600' },
        ].map((c) => (
          <div key={c.label} className="bg-white px-3 py-2.5">
            <p className={`text-lg font-bold ${c.tone ?? 'text-gray-900'}`}>{c.value}</p>
            <p className="text-[11px] text-gray-500 leading-tight">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Daftar prioritas */}
      <div className="divide-y divide-gray-100">
        {top.map((it, idx) => (
          <div key={it.id} className="px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0d404f] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{it.name}</span>
                  <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${RISK_STYLE[it.risiko]}`}>
                    {RISK_LABEL[it.risiko]}
                  </span>
                  <span className="text-[11px] text-gray-400">Urgensi {it.urgensi}/100</span>
                  {it.skorKesehatan != null && (
                    <span className="text-[11px] text-gray-400">· Skor {it.skorKesehatan}</span>
                  )}
                  {it.indeksAncaman != null && (
                    <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                      <ShieldAlert className="w-3 h-3" /> Ancaman {it.indeksAncaman}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{it.ringkasan}</p>
                <ul className="mt-1.5 space-y-1">
                  {it.aksiPrioritas.map((a, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                      <Sprout className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {canExport && (
                <DownloadDropdown
                  buttonLabel="Export"
                  className="flex-shrink-0"
                  items={[{
                    kind: 'pdf',
                    label: `Kebijakan ${it.name} (PDF)`,
                    icon: FileText,
                    onSelect: () => exportLocationPolicyPdf(it),
                  }]}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          Bahan pendukung keputusan; penetapan kebijakan tetap kewenangan pejabat berwenang.
        </p>
      </div>
    </div>
  );
}
