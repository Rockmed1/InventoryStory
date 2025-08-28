import { 
  ArchiveBoxIcon, 
  ArrowsRightLeftIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/app/_components/_ui/client/shadcn-Button";

export default function LandingPageDraft() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">Inventory Story</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#features" className="text-gray-500 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-500 hover:text-gray-900">Pricing</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Sign In</a>
              <Button>Start Free Trial</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Stop Losing Money on{" "}
                <span className="text-blue-600">Inventory Chaos</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                Smart inventory management for small businesses selling across multiple platforms. 
                Track every item, prevent stockouts, and grow with confidence.
              </p>
              <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg" className="flex items-center">
                  <PlayCircleIcon className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                No credit card required • Set up in minutes • Cancel anytime
              </p>
            </div>
            <div className="relative">
              <div className="rounded-lg bg-white p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="font-medium">Wireless Headphones</span>
                    </div>
                    <span className="text-green-600 font-semibold">24 in stock</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="font-medium">Phone Cases</span>
                    </div>
                    <span className="text-yellow-600 font-semibold">3 left</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="font-medium">Laptop Stands</span>
                    </div>
                    <span className="text-red-600 font-semibold">Out of stock</span>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">Real-time inventory dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Tired of inventory spreadsheets that break when you need them most?
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Stop losing sales to stockouts and overselling. One platform to rule all your selling channels.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">😤</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Manual Chaos</h3>
              <p className="mt-2 text-gray-600">
                Spreadsheets, sticky notes, and guesswork leading to costly mistakes
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-2xl">📉</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Lost Revenue</h3>
              <p className="mt-2 text-gray-600">
                Overselling, stockouts, and angry customers hurting your reputation
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Smart Solution</h3>
              <p className="mt-2 text-gray-600">
                Automated inventory sync across all platforms with real-time updates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to manage inventory like a pro
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Powerful features designed for small businesses that want to scale
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Core Inventory Management */}
            <div className="rounded-lg border border-gray-200 p-8">
              <div className="flex items-center">
                <ArchiveBoxIcon className="h-8 w-8 text-blue-600" />
                <h3 className="ml-3 text-xl font-semibold text-gray-900">Core Inventory Management</h3>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Organize every product with descriptions, categories, and photos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Real-time stock levels across all locations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Map your warehouse with bins and zones</span>
                </li>
              </ul>
            </div>

            {/* Multi-Platform Integration */}
            <div className="rounded-lg border border-gray-200 p-8">
              <div className="flex items-center">
                <GlobeAltIcon className="h-8 w-8 text-green-600" />
                <h3 className="ml-3 text-xl font-semibold text-gray-900">Multi-Platform Integration</h3>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Connect eBay, Facebook Marketplace, Craigslist, and more</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Manage all sales channels from one dashboard</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Stock levels sync across platforms instantly</span>
                </li>
              </ul>
            </div>

            {/* Business Intelligence */}
            <div className="rounded-lg border border-gray-200 p-8">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
                <h3 className="ml-3 text-xl font-semibold text-gray-900">Business Intelligence</h3>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Complete audit trail for every movement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Insights to optimize your inventory strategy</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Never run out of your best-selling items</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Get started in 3 simple steps
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              From setup to selling in minutes, not months
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                <CloudArrowUpIcon className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">1. Set Up Your Inventory</h3>
              <p className="mt-4 text-gray-600">
                Import or add items with photos and details. Our smart forms make it quick and easy.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
                <CogIcon className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">2. Connect Your Platforms</h3>
              <p className="mt-4 text-gray-600">
                Link eBay, Facebook, and other selling channels with secure one-click integration.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white">
                <ArrowsRightLeftIcon className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">3. Sell with Confidence</h3>
              <p className="mt-4 text-gray-600">
                Automatic sync prevents overselling and stockouts. Focus on growing your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Trusted by growing businesses
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Join hundreds of sellers who've streamlined their inventory management
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-8">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Sarah Martinez</h4>
                  <p className="text-gray-600">Online Reseller</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "Finally, no more overselling on eBay! Inventory Story keeps everything in sync across all my platforms. 
                My stress levels have dropped dramatically."
              </p>
            </div>
            
            <div className="rounded-lg bg-gray-50 p-8">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                  MJ
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Mike Johnson</h4>
                  <p className="text-gray-600">Small Business Owner</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "Setup took less than an hour. Now I can track 500+ items across warehouse locations 
                and never lose track of anything. Game changer!"
              </p>
            </div>
            
            <div className="rounded-lg bg-gray-50 p-8">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                  LC
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Lisa Chen</h4>
                  <p className="text-gray-600">E-commerce Entrepreneur</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "The multi-platform sync is incredible. I sell on Facebook, Craigslist, and eBay 
                simultaneously without any inventory conflicts."
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div>
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">50K+</div>
                <div className="text-gray-600">Items Tracked</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="mt-16 space-y-8">
            <div className="rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">How long does setup take?</h3>
              <p className="mt-2 text-gray-600">
                Most users are up and running in under an hour. You can import existing inventory 
                or start fresh with our intuitive item creation tools.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">Which platforms do you integrate with?</h3>
              <p className="mt-2 text-gray-600">
                We currently support eBay, Facebook Marketplace, and Craigslist, with more platforms 
                being added regularly based on user feedback.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">Is my data secure?</h3>
              <p className="mt-2 text-gray-600">
                Absolutely. We use enterprise-grade security with encrypted data storage, 
                regular backups, and SOC 2 compliance standards.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">Can I import existing inventory?</h3>
              <p className="mt-2 text-gray-600">
                Yes! You can import from CSV files, Excel spreadsheets, or connect directly 
                from other inventory systems using our migration tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Take Control of Your Inventory?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Join hundreds of sellers who've eliminated inventory chaos and boosted their profits
          </p>
          
          <div className="mt-8 flex flex-col items-center space-y-4">
            <ul className="text-blue-100 space-y-2">
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Set up in minutes, not months
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Sync across all your selling platforms
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Never oversell or run out of stock again
              </li>
            </ul>
            
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 mt-8">
              Start Your Free Trial
            </Button>
            
            <p className="text-blue-200 text-sm">
              No credit card required • Cancel anytime, no questions asked
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Inventory Story</h3>
              <p className="text-gray-400">
                Smart inventory management for growing businesses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Inventory Story. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}