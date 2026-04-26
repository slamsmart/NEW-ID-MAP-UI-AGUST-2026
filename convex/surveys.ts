import { query, mutation } from './_generated/server';
import { v, ConvexError } from 'convex/values';

const tujuanSurveiValidator = v.union(
  v.literal('monitoring'),
  v.literal('potensi_penanaman'),
  v.literal('abrasi'),
  v.literal('pendaratan_penyu'),
  v.literal('monitoring_vegetasi'),
);

const verificationStatusValidator = v.union(
  v.literal('pending'),
  v.literal('approved'),
  v.literal('rejected'),
);

const syncStatusValidator = v.union(
  v.literal('synced'),
  v.literal('pending'),
  v.literal('failed'),
);

const sarangPointValidator = v.object({
  lat: v.string(),
  lng: v.string(),
  catatan: v.optional(v.string()),
  waktu: v.optional(v.string()),
  fotoUrl: v.optional(v.string()),
});

/**
 * Validator return shape — sengaja mirror schema agar type-safe end-to-end.
 * Konstruksinya panjang tapi sekali tulis, dipakai semua fungsi return.
 */
const surveyShape = {
  _id: v.id('surveys'),
  _creationTime: v.number(),
  legacyId: v.string(),
  tujuanSurvei: tujuanSurveiValidator,

  petugasNama: v.string(),
  petugasNip: v.optional(v.string()),
  petugasUnit: v.string(),
  tanggal: v.string(),

  locationId: v.optional(v.string()),
  locationName: v.string(),
  province: v.string(),
  kabKota: v.optional(v.string()),
  kecamatan: v.optional(v.string()),
  koordinatLat: v.optional(v.number()),
  koordinatLng: v.optional(v.number()),
  gpsAccuracy: v.optional(v.number()),
  googleMapsUrl: v.optional(v.string()),

  metodeSurvei: v.optional(v.string()),
  tutupanTajuk: v.optional(v.number()),
  kerapatanEstimasi: v.optional(v.number()),
  spesiesDominan: v.optional(v.string()),
  spesiesLain: v.optional(v.string()),
  lajuRegenerasi: v.optional(v.string()),
  kondisiSerasah: v.optional(v.string()),

  salinitas: v.optional(v.number()),
  ph: v.optional(v.number()),
  suhu: v.optional(v.number()),
  kekeruhan: v.optional(v.number()),
  substrat: v.optional(v.string()),
  elevasi: v.optional(v.number()),
  pasangSurut: v.optional(v.string()),

  ancamanUtama: v.array(v.string()),
  jarakPemukiman: v.optional(v.number()),
  luasTambakEstimasi: v.optional(v.number()),
  aktivitasManusia: v.optional(v.string()),
  statusTenurial: v.optional(v.string()),

  namaArea: v.optional(v.string()),
  luasanPotensi: v.optional(v.number()),
  aksesibilitas: v.optional(v.string()),
  pengaruhPasang: v.optional(v.string()),
  skorPotensi: v.optional(v.number()),

  namaPantai: v.optional(v.string()),
  indikasiAbrasi: v.optional(v.string()),
  kondisiSebelum: v.optional(v.string()),
  kondisiSesudah: v.optional(v.string()),
  tingkatAbrasi: v.optional(v.string()),
  panjangTerdampak: v.optional(v.number()),
  luasanTerdampak: v.optional(v.number()),
  prioritasAbrasi: v.optional(v.string()),

  kondisiUmum: v.optional(v.string()),
  rekomendasiLapangan: v.optional(v.string()),

  jenisPenyu: v.optional(v.string()),
  jumlahSarang: v.optional(v.number()),
  statusPerlindungan: v.optional(v.string()),
  sarangPoints: v.array(sarangPointValidator),

  fotoDokumentasi: v.optional(v.string()),
  photoUrls: v.array(v.string()),

  verificationStatus: verificationStatusValidator,
  verificationNote: v.optional(v.string()),
  verifiedBy: v.optional(v.string()),
  verifiedAt: v.optional(v.string()),

  syncStatus: syncStatusValidator,
};

const surveyReturn = v.object(surveyShape);

/**
 * Args lengkap (semua field) untuk upsert. Identik dengan shape kecuali
 * tidak ada `_id`/`_creationTime`.
 */
const upsertArgs = {
  legacyId: v.string(),
  tujuanSurvei: tujuanSurveiValidator,

  petugasNama: v.string(),
  petugasNip: v.optional(v.string()),
  petugasUnit: v.string(),
  tanggal: v.string(),

  locationId: v.optional(v.string()),
  locationName: v.string(),
  province: v.string(),
  kabKota: v.optional(v.string()),
  kecamatan: v.optional(v.string()),
  koordinatLat: v.optional(v.number()),
  koordinatLng: v.optional(v.number()),
  gpsAccuracy: v.optional(v.number()),
  googleMapsUrl: v.optional(v.string()),

  metodeSurvei: v.optional(v.string()),
  tutupanTajuk: v.optional(v.number()),
  kerapatanEstimasi: v.optional(v.number()),
  spesiesDominan: v.optional(v.string()),
  spesiesLain: v.optional(v.string()),
  lajuRegenerasi: v.optional(v.string()),
  kondisiSerasah: v.optional(v.string()),

  salinitas: v.optional(v.number()),
  ph: v.optional(v.number()),
  suhu: v.optional(v.number()),
  kekeruhan: v.optional(v.number()),
  substrat: v.optional(v.string()),
  elevasi: v.optional(v.number()),
  pasangSurut: v.optional(v.string()),

  ancamanUtama: v.array(v.string()),
  jarakPemukiman: v.optional(v.number()),
  luasTambakEstimasi: v.optional(v.number()),
  aktivitasManusia: v.optional(v.string()),
  statusTenurial: v.optional(v.string()),

  namaArea: v.optional(v.string()),
  luasanPotensi: v.optional(v.number()),
  aksesibilitas: v.optional(v.string()),
  pengaruhPasang: v.optional(v.string()),
  skorPotensi: v.optional(v.number()),

  namaPantai: v.optional(v.string()),
  indikasiAbrasi: v.optional(v.string()),
  kondisiSebelum: v.optional(v.string()),
  kondisiSesudah: v.optional(v.string()),
  tingkatAbrasi: v.optional(v.string()),
  panjangTerdampak: v.optional(v.number()),
  luasanTerdampak: v.optional(v.number()),
  prioritasAbrasi: v.optional(v.string()),

  kondisiUmum: v.optional(v.string()),
  rekomendasiLapangan: v.optional(v.string()),

  jenisPenyu: v.optional(v.string()),
  jumlahSarang: v.optional(v.number()),
  statusPerlindungan: v.optional(v.string()),
  sarangPoints: v.array(sarangPointValidator),

  fotoDokumentasi: v.optional(v.string()),
  photoUrls: v.array(v.string()),

  verificationStatus: v.optional(verificationStatusValidator),
  verificationNote: v.optional(v.string()),
  verifiedBy: v.optional(v.string()),
  verifiedAt: v.optional(v.string()),

  syncStatus: v.optional(syncStatusValidator),
};

// ── QUERIES ────────────────────────────────────────────────────────────────

/** List terbaru — 200 baris, urut desc. */
export const list = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(surveyReturn),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 200, 500);
    return await ctx.db.query('surveys').order('desc').take(limit);
  },
});

export const getByLegacyId = query({
  args: { legacyId: v.string() },
  returns: v.union(surveyReturn, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('surveys')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();
  },
});

export const listByTujuan = query({
  args: { tujuanSurvei: tujuanSurveiValidator, limit: v.optional(v.number()) },
  returns: v.array(surveyReturn),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 200, 500);
    return await ctx.db
      .query('surveys')
      .withIndex('by_tujuan', (q) => q.eq('tujuanSurvei', args.tujuanSurvei))
      .order('desc')
      .take(limit);
  },
});

export const listByVerification = query({
  args: { status: verificationStatusValidator },
  returns: v.array(surveyReturn),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('surveys')
      .withIndex('by_verification', (q) => q.eq('verificationStatus', args.status))
      .order('desc')
      .collect();
  },
});

/** Statistik agregat untuk dashboard. */
export const stats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    today: v.number(),
    pending: v.number(),
    approved: v.number(),
    rejected: v.number(),
    lastSubmit: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) => {
    const all = await ctx.db.query('surveys').order('desc').take(500);
    const todayKey = new Date().toISOString().split('T')[0];
    return {
      total: all.length,
      today: all.filter((s) => s.tanggal.startsWith(todayKey)).length,
      pending: all.filter((s) => s.verificationStatus === 'pending').length,
      approved: all.filter((s) => s.verificationStatus === 'approved').length,
      rejected: all.filter((s) => s.verificationStatus === 'rejected').length,
      lastSubmit: all[0]?.tanggal ?? null,
    };
  },
});

// ── MUTATIONS ──────────────────────────────────────────────────────────────

/**
 * Upsert survei by legacyId. Idempotent — aman untuk retry & sync queue offline.
 */
export const upsert = mutation({
  args: upsertArgs,
  returns: v.id('surveys'),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('surveys')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();

    const payload = {
      ...args,
      verificationStatus: args.verificationStatus ?? 'pending',
      syncStatus: args.syncStatus ?? 'synced',
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert('surveys', payload);
  },
});

/**
 * Verify survei — hanya untuk role verifikator (caller harus enforce auth).
 */
export const verify = mutation({
  args: {
    legacyId: v.string(),
    status: v.union(v.literal('approved'), v.literal('rejected')),
    note: v.optional(v.string()),
    verifiedBy: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('surveys')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();
    if (!existing) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Survei tidak ditemukan.' });
    }
    await ctx.db.patch(existing._id, {
      verificationStatus: args.status,
      verificationNote: args.note,
      verifiedBy: args.verifiedBy,
      verifiedAt: new Date().toISOString(),
    });
    return null;
  },
});

export const remove = mutation({
  args: { legacyId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('surveys')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      // Hapus foto terkait
      const photos = await ctx.db
        .query('surveyPhotos')
        .withIndex('by_survey', (q) => q.eq('surveyLegacyId', args.legacyId))
        .collect();
      await Promise.all(photos.map((p) => ctx.db.delete(p._id)));
    }
    return null;
  },
});
