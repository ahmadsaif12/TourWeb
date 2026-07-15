import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-grid">
        <div>
          <p className="footer-title">HamroTour</p>
          <p className="muted">
            A modern travel marketplace rebuilt with Django, Next.js, and S3 media storage.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/listings">Listings</Link>
          <Link href="/host/new">Host</Link>
          <Link href="/contact">Support</Link>
        </div>
      </div>
    </footer>
  );
}
