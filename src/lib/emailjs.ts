/**
 * EmailJS Configuration — ID-MAP OTP Sender
 * Dashboard: https://dashboard.emailjs.com
 *
 * Sender Gmail : id.map.admin@gmail.com
 * App Password : hhbwmfzgtegscccp  (16-char Gmail App Password)
 * From Name    : ID MAP Admin
 *
 * Langkah konfigurasi EmailJS:
 * 1. Email Services → Edit service → pastikan connected Gmail = id.map.admin@gmail.com
 * 2. Email Templates → template_kyj2dbv → From Name = {{from_name}} → Save
 * 3. Pastikan variabel template ini tersedia:
 *      {{to_email}}, {{user_name}}, {{otp_code}}, {{otp_exp}},
 *      {{from_name}}, {{company_name}}, {{reply_to}}
 */

export const EMAILJS_CONFIG = {
  SERVICE_ID:   'service_0l41gcg',
  TEMPLATE_ID:  'template_kyj2dbv',
  PUBLIC_KEY:   'HHeFbGLfn7zad_diq',
  SENDER_NAME:  'ID MAP Admin',
  SENDER_EMAIL: 'id.map.admin@gmail.com',
};

export interface EmailJSTemplateParams {
  to_email:     string;   // email tujuan
  user_name:    string;   // username penerima
  otp_code:     string;   // kode OTP 6 digit
  otp_exp:      string;   // durasi berlaku, misal "15"
  from_name:    string;   // nama pengirim → "ID MAP Admin"
  from_email:   string;   // email pengirim
  company_name: string;   // nama aplikasi → "ID-MAP"
  reply_to:     string;   // reply-to address
}
