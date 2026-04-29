import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#eae7e7] text-[#50443f]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5" aria-label="LUXE BEAUTÉ - Home">
              <span className="text-[#7a5646] text-2xl font-heading select-none" aria-hidden="true">✦</span>
              <span className="text-xl font-heading text-[#1b1c1c] tracking-tight">LUXE BEAUTÉ</span>
            </Link>
            <p className="text-sm text-[#50443f]/80 mb-6 max-w-xs leading-relaxed">
              Premium beauty essentials curated for the discerning clientele. Experience radiance reimagined.
            </p>
            <div className="flex gap-5">
              <a href="#" className="text-[#50443f]/70 hover:text-[#7a5646] transition-colors text-sm font-medium">Instagram</a>
              <a href="#" className="text-[#50443f]/70 hover:text-[#7a5646] transition-colors text-sm font-medium">Facebook</a>
            </div>
          </div>
          
          <div>
            <h3 className="label-editorial text-[#1b1c1c] mb-5">SHOP</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/tienda" className="hover:text-[#7a5646] transition-colors">All Products</Link></li>
              <li><Link href="/tienda?sort=newest" className="hover:text-[#7a5646] transition-colors">Best Sellers</Link></li>
              <li><Link href="/tienda?sort=newest" className="hover:text-[#7a5646] transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="label-editorial text-[#1b1c1c] mb-5">SUPPORT</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-[#7a5646] transition-colors">Shipping & Returns</Link></li>
              <li><Link href="#" className="hover:text-[#7a5646] transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-[#7a5646] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="label-editorial text-[#1b1c1c] mb-5">NEWSLETTER</h3>
            <p className="text-sm text-[#50443f]/80 mb-5">Subscribe for exclusive offers.</p>
            <form className="flex flex-col sm:flex-row gap-2" aria-label="Newsletter subscription">
              <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
              <input 
                id="footer-newsletter-email"
                type="email" 
                placeholder="Your email" 
                className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-[#d4c3bc]/30 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#7a5646] transition-colors"
              />
              <button type="button" className="px-5 py-2.5 rounded-lg bg-[#7a5646] hover:bg-[#603f30] text-white text-sm font-medium transition-colors">
                JOIN
              </button>
            </form>
          </div>
        </div>
        <div className="divider-luminous mt-14 pt-8 text-center text-sm text-[#50443f]/50">
          &copy; {new Date().getFullYear()} LUXE BEAUTÉ. All rights reserved.
        </div>
      </div>
    </footer>
  );
}