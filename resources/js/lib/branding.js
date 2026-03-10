export function resolveBrandLogoUrl(branding, darkModeEnabled = false) {
  if (!branding) return null;

  const lightLogoUrl = branding.light_logo_url || branding.logo_url || null;
  const darkLogoUrl = branding.dark_logo_url || lightLogoUrl;

  return darkModeEnabled ? (darkLogoUrl || lightLogoUrl) : (lightLogoUrl || darkLogoUrl);
}
