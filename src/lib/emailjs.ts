/**
 * EmailJS Configuration — ID-MAP OTP Sender
 * Isi nilai-nilai di bawah sesuai EmailJS dashboard kamu:
 * https://dashboard.emailjs.com
 */

export const EMAILJS_CONFIG = {
  SERVICE_ID:  'service_0l41gcg',
  TEMPLATE_ID: 'template_kyj2dbv',
  PUBLIC_KEY:  'HHeFbGLfn7zad_diq',
};

/**
 * Variabel template yang dikirim ke EmailJS.
 * Pastikan nama variabel ini sesuai dengan template di EmailJS dashboard.
 * Contoh template body:
 *   Kode OTP ID-MAP Anda: {{otp_code}}
 *   Berlaku {{otp_exp}} menit.
 *   Halo {{user_name}}, terima kasih telah mendaftar.
 */
export interface EmailJSTemplateParams {
  to_email:  string;  // email tujuan
  user_name: string;  // nama penerima (atau email jika tidak ada nama)
  otp_code:  string;  // kode OTP 6 digit
  otp_exp:   string;  // durasi berlaku, misal "10"
}
