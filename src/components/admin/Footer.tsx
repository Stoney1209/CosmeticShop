import Link from "next/link";

export function AdminFooter() {
  return (
    <footer className="border-t border-[#d4c3bc]/30 bg-[#f6f3f2] py-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#7a5646] text-xl font-heading">✦</span>
              <span className="text-lg font-heading text-[#1b1c1c]">LUXE BEAUTÉ</span>
            </div>
            <p className="text-sm text-[#82746e] leading-relaxed max-w-xs">
              Professional backend management for the Luxe Beauté ecosystem. Ensure brand standards and operational excellence across all touchpoints.
            </p>
          </div>
          
          <div>
            <h3 className="label-editorial text-[#1b1c1c] mb-4">INTERNAL LINKS</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-[#82746e] hover:text-[#7a5646] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#82746e] hover:text-[#7a5646] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="label-editorial text-[#1b1c1c] mb-4">SUPPORT</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-[#82746e] hover:text-[#7a5646] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#82746e] hover:text-[#7a5646] transition-colors">
                  Technical Docs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-luminous pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#82746e]">
              © 2024 LUXE BEAUTÉ. ALL RIGHTS RESERVED. SYSTEM V4.2.0
            </p>
            <p className="text-xs text-[#82746e]">
              ADMINISTRATIVE SUITE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
