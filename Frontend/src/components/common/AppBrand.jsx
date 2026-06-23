import {
  APP_NAME,
  INSTITUTION_MONOGRAM,
  INSTITUTION_NAME,
} from 'constants/branding';

export default function AppBrand({
  variant = 'sidebar',
  tagline,
  title,
  subtitle,
}) {
  if (variant === 'sidebar') {
    return (
      <div className="sidebar-brand">
        <div className="brand-hero brand-hero--sidebar">
          <div className="brand-monogram" aria-hidden="true">
            <span className="brand-monogram-text">{INSTITUTION_MONOGRAM}</span>
          </div>
          <h1 className="brand-name-highlight">{INSTITUTION_NAME}</h1>
          <p className="brand-app-name">{APP_NAME}</p>
          {tagline && <span className="brand-portal-badge">{tagline}</span>}
        </div>
      </div>
    );
  }

  if (variant === 'auth') {
    return (
      <div className="brand-hero brand-hero--auth">
        <div className="brand-monogram brand-monogram--lg" aria-hidden="true">
          <span className="brand-monogram-text">{INSTITUTION_MONOGRAM}</span>
        </div>
        <h1 className="brand-name-highlight brand-name-highlight--auth">{INSTITUTION_NAME}</h1>
        <p className="brand-app-name brand-app-name--auth">{title || APP_NAME}</p>
        {(subtitle || tagline) && (
          <p className="brand-auth-message">{subtitle || tagline}</p>
        )}
      </div>
    );
  }

  return (
    <div className="institution-banner" title={INSTITUTION_NAME}>
      <span className="institution-banner-accent" aria-hidden="true" />
      <span className="institution-banner-text">{INSTITUTION_NAME}</span>
    </div>
  );
}
