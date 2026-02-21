import jalaali from 'jalaali-js';

/**
 * تبدیل تاریخ میلادی به شمسی
 * @param {Date|string} date - تاریخ میلادی
 * @returns {string} - تاریخ شمسی به فرمت YYYY/MM/DD
 */
export function toJalali(date) {
  if (!date) return '';

  const d = new Date(date);
  const jDate = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());

  return `${jDate.jy}/${String(jDate.jm).padStart(2, '0')}/${String(jDate.jd).padStart(2, '0')}`;
}

/**
 * تبدیل تاریخ شمسی به میلادی
 * @param {string} jalaliDate - تاریخ شمسی (YYYY/MM/DD)
 * @returns {Date} - تاریخ میلادی
 */
export function toGregorian(jalaliDate) {
  if (!jalaliDate) return null;

  const parts = jalaliDate.split('/');
  if (parts.length !== 3) return null;

  const jy = parseInt(parts[0]);
  const jm = parseInt(parts[1]);
  const jd = parseInt(parts[2]);

  const gDate = jalaali.toGregorian(jy, jm, jd);
  return new Date(gDate.gy, gDate.gm - 1, gDate.gd);
}

/**
 * دریافت تاریخ امروز به شمسی
 * @returns {string} - تاریخ امروز به شمسی
 */
export function getTodayJalali() {
  return toJalali(new Date());
}

/**
 * فرمت کردن تاریخ شمسی با نام ماه
 * @param {string} jalaliDate - تاریخ شمسی
 * @returns {string} - مثلاً: "15 فروردین 1403"
 */
export function formatJalaliLong(jalaliDate) {
  if (!jalaliDate) return '';

  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const parts = jalaliDate.split('/');
  if (parts.length !== 3) return jalaliDate;

  const year = parts[0];
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);

  return `${day} ${monthNames[month - 1]} ${year}`;
}

/**
 * تبدیل اعداد انگلیسی به فارسی
 * @param {string} str - رشته با اعداد انگلیسی
 * @returns {string} - رشته با اعداد فارسی
 */
export function toPersianNumbers(str) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.toString().replace(/\d/g, (digit) => persianDigits[digit]);
}

/**
 * اعتبارسنجی تاریخ شمسی
 * @param {string} jalaliDate - تاریخ شمسی (YYYY/MM/DD)
 * @returns {boolean} - معتبر یا نه
 */
export function isValidJalaliDate(jalaliDate) {
  if (!jalaliDate) return false;

  const parts = jalaliDate.split('/');
  if (parts.length !== 3) return false;

  const jy = parseInt(parts[0]);
  const jm = parseInt(parts[1]);
  const jd = parseInt(parts[2]);

  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return false;
  if (jm < 1 || jm > 12) return false;
  if (jd < 1 || jd > 31) return false;

  try {
    jalaali.toGregorian(jy, jm, jd);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * محاسبه اختلاف دو تاریخ شمسی (به روز)
 * @param {string} date1 - تاریخ اول
 * @param {string} date2 - تاریخ دوم
 * @returns {number} - تعداد روزهای بین دو تاریخ
 */
export function daysBetweenJalali(date1, date2) {
  const gDate1 = toGregorian(date1);
  const gDate2 = toGregorian(date2);

  if (!gDate1 || !gDate2) return 0;

  const diffTime = Math.abs(gDate2 - gDate1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * فرمت کردن تاریخ با اعداد فارسی
 * @param {Date|string} date - تاریخ میلادی
 * @param {string} format - فرمت: 'short' یا 'long'
 * @returns {string} - تاریخ شمسی با اعداد فارسی
 */
export function formatJalali(date, format = 'short') {
  if (!date) return '';

  const jalaliDate = toJalali(date);

  if (format === 'long') {
    return toPersianNumbers(formatJalaliLong(jalaliDate));
  }

  return toPersianNumbers(jalaliDate);
}

/**
 * فرمت زمان نسبی (مثلاً: ۵ دقیقه پیش)
 * @param {Date|string} date - تاریخ
 * @returns {string} - زمان نسبی
 */
export function formatRelativeTime(date) {
  if (!date) return '';

  const d = new Date(date);
  const now = new Date();
  const diff = now - d;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const persianTime = (n) => toPersianNumbers(n.toString());

  if (seconds < 60) return 'همین الان';
  if (minutes < 60) return `${persianTime(minutes)} دقیقه پیش`;
  if (hours < 24) return `${persianTime(hours)} ساعت پیش`;
  if (days < 30) return `${persianTime(days)} روز پیش`;

  return formatJalali(date, 'short');
}
