
import Link from "next/link";
import { Boxes, HandCoins, ArrowRight, GanttChartSquare } from "lucide-react";

// Main component for the landing page
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}

// Hero Section: The first thing users see
function HeroSection() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40 bg-white text-center">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            Effortless Inventory Control, From Warehouse to Sale.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Our intuitive platform helps you track every item, manage stock
            levels, and make data-driven decisions with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
            >
              Get Started for Free
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-12 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section: Highlighting key functionalities
function FeaturesSection() {
  const features = [
    {
      icon: <Boxes className="h-8 w-8 text-gray-900" />,
      title: "Centralized Item Management",
      description:
        "Define, categorize, and manage all your products in one place. Track essential details from SKU to quantity on hand.",
    },
    {
      icon: <HandCoins className="h-8 w-8 text-gray-900" />,
      title: "Granular Transaction Logging",
      description:
        "Log every stock movement, including purchases, sales, and internal transfers, for a complete audit trail.",
    },
    {
      icon: <GanttChartSquare className="h-8 w-8 text-gray-900" />,
      title: "Structured Physical Organization",
      description:
        "Map your physical space with locations and bins. Know exactly where every item is stored.",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-3 lg:gap-16">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section: Simplifying the user journey
function HowItWorksSection() {
  const steps = [
    {
      step: 1,
      title: "Sign Up",
      description: "Create your account in seconds.",
    },
    {
      step: 2,
      title: "Add Your Items",
      description: "Easily populate your inventory using our simple forms.",
    },
    {
      step: 3,
      title: "Start Tracking",
      description: "Log transactions as they happen and gain immediate control.",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg">Getting started is as easy as one, two, three.</p>
        </div>
        <div className="relative">
          {/* Dotted line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
          
          <div className="grid gap-12 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.step} className="relative flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-full text-2xl font-bold border-4 border-white z-10">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mt-6 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


// Final CTA Section: A final prompt to sign up
function FinalCTASection() {
  return (
    <section className="w-full py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
          Take Control of Your Inventory Today
        </h2>
        <Link
          href="/sign-up"
          className="inline-flex h-12 items-center justify-center rounded-md bg-gray-900 px-10 text-base font-medium text-gray-50 shadow transition-colors hover:bg-gray-800"
        >
          Sign Up Now
        </Link>
      </div>
    </section>
  );
}

// Footer: Standard navigation and copyright
function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Inventory Systems Inc. All rights reserved.
        </p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="/sign-in" className="text-sm text-gray-600 hover:underline">
            Login
          </Link>
          <Link href="/sign-up" className="text-sm text-gray-600 hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  );
}
