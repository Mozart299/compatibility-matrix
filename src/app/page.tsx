
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <path d="M8.5 8.5v.01" />
              <path d="M16 12v.01" />
              <path d="M12 16v.01" />
            </svg>
            <span>Compatibility Matrix</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Discover deeper
                  <span className="text-primary"> connections</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Our advanced compatibility matrix analyzes multiple dimensions of personality, values, and communication styles to help you build stronger relationships.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-72 md:h-96">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="240"
                    height="240"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-50"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16.2 7.8l-2 6.8-6.8 2-2-6.8 6.8-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our comprehensive approach to understanding compatibility.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Multidimensional Assessment",
                  description: "Complete a scientifically designed assessment that measures personality traits, values, communication styles, and more.",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 6h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3"></path>
                      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"></path>
                      <path d="M12 11h4"></path>
                      <path d="M12 16h4"></path>
                      <path d="M8 11h.01"></path>
                      <path d="M8 16h.01"></path>
                    </svg>
                  ),
                },
                {
                  title: "Compatibility Analysis",
                  description: "Our algorithm analyzes compatibility across key dimensions, identifying areas of strength and potential challenges.",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18"></path>
                      <path d="m19 9-5 5-4-4-3 3"></path>
                    </svg>
                  ),
                },
                {
                  title: "Visual Matrix",
                  description: "Explore compatibility results in an intuitive visual matrix, with detailed insights into each relationship dimension.",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <rect x="7" y="7" width="3" height="3"></rect>
                      <rect x="14" y="7" width="3" height="3"></rect>
                      <rect x="7" y="14" width="3" height="3"></rect>
                      <rect x="14" y="14" width="3" height="3"></rect>
                    </svg>
                  ),
                },
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                What Our Users Say
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Discover how the Compatibility Matrix has transformed relationships.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  quote: "The compatibility insights completely changed how I understand my team dynamics. We've improved our collaboration significantly.",
                  author: "Sarah J.",
                  role: "Team Lead",
                },
                {
                  quote: "I was skeptical at first, but the assessment was incredibly accurate. It helped me identify patterns in my relationships I hadn't recognized.",
                  author: "Marcus T.",
                  role: "Business Consultant",
                },
                {
                  quote: "Using the compatibility matrix for our team building was a game-changer. We now understand each other's communication styles much better.",
                  author: "Elena R.",
                  role: "HR Director",
                },
              ].map((testimonial, index) => (
                <div key={index} className="p-6 border rounded-lg">
                  <svg className="h-6 w-6 text-muted-foreground mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="mb-4">{testimonial.quote}</p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">{testimonial.author.split(' ')[0][0]}{testimonial.author.split(' ')[1][0]}</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">{testimonial.author}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Ready to discover deeper connections?
              </h2>
              <p className="text-lg mb-8">
                Start your compatibility journey today and gain insights that transform your relationships.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-semibold mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                  <path d="M8.5 8.5v.01" />
                  <path d="M16 12v.01" />
                  <path d="M12 16v.01" />
                </svg>
                <span>Compatibility Matrix</span>
              </div>
              <p className="text-muted-foreground">
                Advanced compatibility analysis for meaningful relationships.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link href="/team" className="text-muted-foreground hover:text-foreground">Team</Link></li>
                <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-muted-foreground hover:text-foreground">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t">
            <p className="text-center text-muted-foreground">
              &copy; {new Date().getFullYear()} Compatibility Matrix. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}