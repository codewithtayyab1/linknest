// Returns 'mobile' | 'tablet' | 'desktop' | 'unknown' from a User-Agent string.
// Order matters: check tablet before mobile since tablet UAs often contain "mobile" too.
const parseDevice = (ua = '') => {
  if (!ua) return 'unknown';
  const s = ua.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))|kindle|silk|playbook/.test(s)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|windows phone|opera mini|iemobile/.test(s)) return 'mobile';
  return 'desktop';
};

module.exports = parseDevice;
