import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">FindMyGym</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Discover the best gyms near you. Compare, review, and find your perfect fitness home.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Explore</h3>
            <ul className="space-y-3">
              <li><Link href="/gyms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Gyms</Link></li>
              <li><Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compare Gyms</Link></li>
              <li><Link href="/gyms?type=yoga" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Yoga Studios</Link></li>
              <li><Link href="/gyms?type=crossfit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">CrossFit Boxes</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Categories</h3>
            <ul className="space-y-3">
              <li><Link href="/gyms?priceRange=budget" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Budget Gyms</Link></li>
              <li><Link href="/gyms?priceRange=premium" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Premium Gyms</Link></li>
              <li><Link href="/gyms?type=women_only" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Women Only</Link></li>
              <li><Link href="/gyms?type=24x7" className="text-sm text-muted-foreground hover:text-foreground transition-colors">24/7 Gyms</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Account</h3>
            <ul className="space-y-3">
              <li><Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link href="/auth/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create Account</Link></li>
              <li><Link href="/favorites" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Favorites</Link></li>
              <li><Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FindMyGym. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Made with ❤️ for fitness enthusiasts</p>
        </div>
      </div>
    </footer>
  );
}
