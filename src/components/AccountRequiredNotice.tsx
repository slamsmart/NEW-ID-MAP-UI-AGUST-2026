/**
 * AccountRequiredNotice — popup notif saat user mencoba akses fitur ber-akun
 * tetapi Clerk belum dikonfigurasi (atau kita ingin tampilkan notif friendly
 * sebelum mengarahkan ke pendaftaran).
 *
 * Pakai context kecil agar bisa dipanggil dari mana saja dengan
 * `useAccountNotice().show(...)`.
 */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { UserPlus, X, ShieldCheck, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NoticeOptions = {
  /** Judul ringkas, default: "Perlu Akun" */
  title?: string;
  /** Pesan utama, default explainer ramah */
  message?: string;
};

type NoticeContextValue = {
  show: (opts?: NoticeOptions) => void;
};

const NoticeContext = createContext<NoticeContextValue>({ show: () => {} });

export function AccountNoticeProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<NoticeOptions>({});
  const navigate = useNavigate();

  const show = useCallback((o?: NoticeOptions) => {
    setOpts(o ?? {});
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return (
    <NoticeContext.Provider value={{ show }}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6 animate-fade-in"
          onClick={close}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 sm:p-7 animate-fade-up text-fade-scope"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0d404f] to-[#071520] shadow-lg">
              <UserPlus className="h-7 w-7 text-white" />
            </div>

            <h3 className="text-center text-lg font-bold text-slate-900">
              {opts.title ?? 'Perlu Akun untuk Akses Fitur Ini'}
            </h3>
            <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
              {opts.message ??
                'Untuk mengunduh data, melihat detail lengkap, atau mengirim survei lapangan, Anda perlu memiliki akun ID-MAP. Pendaftaran gratis dan hanya butuh beberapa detik.'}
            </p>

            <div className="mt-5 space-y-2">
              {/* Tombol utama: Login — untuk user yang sudah punya akun */}
              <button
                type="button"
                onClick={() => {
                  close();
                  navigate('/login');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#071520] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#0d404f] transition"
              >
                <LogIn className="h-4 w-4" /> Login Sekarang
              </button>
              {/* Daftar akun baru */}
              <button
                type="button"
                onClick={() => {
                  close();
                  navigate('/login');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#0d404f]/30 bg-[#0d404f]/10 px-5 py-2.5 text-sm font-semibold text-[#0d404f] hover:bg-[#0d404f]/20 transition"
              >
                <UserPlus className="h-4 w-4" /> Daftar Akun Baru
              </button>
              <button
                type="button"
                onClick={() => {
                  close();
                  navigate('/login');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <ShieldCheck className="h-4 w-4" /> Saya Admin / Verifikator
              </button>
              <button
                type="button"
                onClick={close}
                className="w-full px-5 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition"
              >
                Tutup
              </button>
            </div>

            <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
              Pendaftaran publik via Google/akun sosial sedang dalam persiapan.
              Sementara itu hubungi admin Cabdin KP Kab. Malang untuk mendapat
              akses.
            </p>
          </div>
        </div>
      )}
    </NoticeContext.Provider>
  );
}

export function useAccountNotice() {
  return useContext(NoticeContext);
}
