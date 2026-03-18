import { useNavigate } from "react-router";
import { ArrowRight, ShoppingCart, Package, Wallet, Users, TrendingUp, Smartphone, Check, Zap, Shield, Globe, Star } from "lucide-react";
import { useState, useEffect } from "react";

export function LandingPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: ShoppingCart,
      title: "Smart POS System",
      description: "Lightning-fast sales with barcode scanning, mobile money integration (M-Pesa, Tigo, Airtel, Halopesa), and instant receipts.",
      highlight: "Process sales in under 10 seconds"
    },
    {
      icon: Package,
      title: "Real-Time Inventory",
      description: "Never run out of stock again. Automatic alerts, supplier management, and instant stock updates with every sale.",
      highlight: "Live stock tracking across all products"
    },
    {
      icon: Wallet,
      title: "Complete Cashbook",
      description: "Track every shilling. Automated expense recording, mobile money reconciliation, and daily profit calculations.",
      highlight: "Auto-sync with 4 mobile money wallets"
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Manage credit sales, track payment history, loyalty rewards, and automated debt follow-ups via SMS.",
      highlight: "Built-in credit scoring system"
    },
    {
      icon: TrendingUp,
      title: "Business Intelligence",
      description: "Weekly AI reports, profit trends, best-selling products, and actionable insights to grow your revenue.",
      highlight: "AI-powered business advisor"
    },
    {
      icon: Shield,
      title: "TRA Compliance",
      description: "EFD Z-Report generator for Tanzania Revenue Authority. Stay compliant with automatic fiscal reporting.",
      highlight: "100% TRA compliant"
    }
  ];

  const benefits = [
    "✓ Works offline - No internet? No problem",
    "✓ Mobile-first design - Use on any device",
    "✓ Swahili & English support",
    "✓ Free forever for pilot users",
    "✓ Live ClickPesa integration",
    "✓ Daily business training & tips"
  ];

  const testimonials = [
    {
      name: "Amina Hassan",
      business: "Kariakoo Hardware Store",
      quote: "CREOVA helped me track my inventory properly for the first time. I discovered I was losing TSh 200,000 per month to stock errors!",
      rating: 5
    },
    {
      name: "Juma Mwakasege",
      business: "Mwenge Agro Supplies",
      quote: "The mobile money integration is a game changer. No more manual reconciliation. Everything syncs automatically!",
      rating: 5
    },
    {
      name: "Fatuma Abdallah",
      business: "Sinza Pharmacy",
      quote: "My customers love the loyalty system. Sales are up 35% since we started using CREOVA.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">CREOVA</h1>
                <p className="text-xs text-muted-foreground">Akili Ya Biashara Yako</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Launch App
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Now Live in Dar es Salaam - Kariakoo Pilot Market</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              The Complete Business Management System for{" "}
              <span className="text-primary">Tanzania</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Built specifically for retail dukas, agro-dealers, and small pharmacies. 
              Manage sales, inventory, cashbook, and customers - all in one powerful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-card border border-border text-foreground rounded-lg hover:border-primary transition-colors font-semibold text-lg"
              >
                See Features
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Active Businesses</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-1">TSh 2.5B+</div>
                <div className="text-sm text-muted-foreground">Sales Processed</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-1">50K+</div>
                <div className="text-sm text-muted-foreground">Daily Transactions</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-1">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything Your Business Needs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              7 powerful modules designed specifically for Tanzanian SMEs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10 group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-3">{feature.description}</p>
                <div className="inline-flex items-center gap-2 text-sm text-primary font-medium">
                  <Check className="w-4 h-4" />
                  <span>{feature.highlight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Built for Tanzania, By Tanzanians
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  We understand the unique challenges of running a business in East Africa. 
                  CREOVA is designed to work seamlessly with local payment systems, comply with TRA regulations, 
                  and function perfectly even with unreliable internet.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{benefit.replace('✓ ', '')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-center">Why Choose CREOVA?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Mobile Money Integration</h4>
                      <p className="text-sm text-muted-foreground">Auto-sync M-Pesa, Tigo, Airtel, Halopesa transactions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Works Offline</h4>
                      <p className="text-sm text-muted-foreground">Continue selling even when internet is down</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">TRA Compliant</h4>
                      <p className="text-sm text-muted-foreground">Automatic EFD Z-Reports for tax compliance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">AI Business Advisor</h4>
                      <p className="text-sm text-muted-foreground">Get smart recommendations to grow your revenue</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Trusted by Dar es Salaam Businesses</h2>
            <p className="text-xl text-muted-foreground">See what shop owners are saying about CREOVA</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary transition-all hover:shadow-lg"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                <div className="border-t border-border pt-4">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 500+ businesses in Dar es Salaam using CREOVA to increase profits and save time.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-10 py-5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-xl flex items-center justify-center gap-3 mx-auto shadow-2xl shadow-primary/30"
            >
              Start Free Trial - No Credit Card Required
              <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-sm text-muted-foreground mt-4">
              🎉 Free forever for Kariakoo pilot users • Set up in under 5 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="text-xl font-bold text-primary">CREOVA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Akili Ya Biashara Yako - Smart Business Management for Tanzania
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
                <li><a href="#" className="hover:text-primary">WhatsApp: +255 XXX XXX XXX</a></li>
                <li><a href="#" className="hover:text-primary">Video Tutorials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary">TRA Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 CREOVA. Built with ❤️ for Tanzanian businesses. Kariakoo Pilot Market.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
