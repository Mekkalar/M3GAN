import Link from 'next/link';
import { Mail, ArrowRight, Layout, Home, ChevronLeft, Layers, Package, ShieldCheck, Truck, History, Plus, LogIn, UserPlus, UserCheck, User, MessageSquare, MousePointerClick } from 'lucide-react';

const TEMPLATES = [
    {
        title: 'Landing Page',
        description: 'Modern Minimal Luxury Home Page',
        href: '/template-showcase/landing-page',
        icon: Home
    },
    {
        title: 'OTP Verification',
        description: 'Security code entry screen',
        href: '/template-showcase/otp-verification',
        icon: Mail
    },
    {
        title: 'Product Detail',
        description: 'Comprehensive product view with gallery and calendar',
        href: '/template-showcase/product-detail',
        icon: Layout
    },
    {
        title: 'Search Results',
        description: 'Product listing with sidebar filters and grid view',
        href: '/template-showcase/search-results',
        icon: Layers
    },
    {
        title: 'Booking / Checkout',
        description: 'Checkout process with date selection and payment options',
        href: '/template-showcase/booking-checkout',
        icon: Package
    },
    {
        title: 'Payment (Escrow)',
        description: 'Secure payment with QR Code and Credit Card escrow',
        href: '/template-showcase/payment',
        icon: ShieldCheck
    },
    {
        title: 'Rental Status',
        description: 'Order timeline tracking and details',
        href: '/template-showcase/rental-tracking',
        icon: Truck
    },
    {
        title: 'Rental History',
        description: 'List of all previous and current rentals',
        href: '/template-showcase/rental-history',
        icon: History
    },
    {
        title: 'Login',
        description: 'Classic luxury login experience',
        href: '/template-showcase/login',
        icon: LogIn
    },
    {
        title: 'Register',
        description: 'Split-view registration for new users',
        href: '/template-showcase/register',
        icon: UserPlus
    },
    {
        title: 'KYC Verification',
        description: 'Identity verification with ID card upload',
        href: '/template-showcase/kyc-verification',
        icon: UserCheck
    },
    {
        title: 'User Profile',
        description: 'Account settings and personal information management',
        href: '/template-showcase/user-profile',
        icon: User
    },
    {
        title: 'Chat System',
        description: 'Full-screen conversation management interface',
        href: '/template-showcase/chat',
        icon: MessageSquare
    },
    {
        title: 'Floating Chat',
        description: 'Minimalist overlay for quick shop communication',
        href: '/template-showcase/chat/floating-test',
        icon: MousePointerClick
    },
];

export default function TemplateShowcasePage() {
    return (
        <main className="min-h-screen bg-slate-50 p-6 doc-bg-pattern font-sans text-foreground flex flex-col items-center">

            {/* Main Container - Extended Width for Grid */}
            <div className="w-full max-w-7xl space-y-8">

                {/* Header Section - Modern Hero Style */}
                <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-[var(--shadow-elevation-medium)]">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4"></div>

                    <div className="relative z-10 px-8 py-12 md:py-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-4 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium tracking-wider uppercase text-white/90">
                                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                                Design System v1.2
                            </div>
                            <h1 className="text-4xl md:text-5xl font-sans font-medium tracking-tight text-white leading-tight">
                                Template Showcase
                            </h1>
                            <p className="text-lg text-white/80 font-light max-w-xl leading-relaxed">
                                A curated collection of UI components designed with modern minimal luxury conceptualization.
                            </p>
                        </div>

                        {/* Back to System Button */}
                        <Link
                            href="/"
                            className="group flex items-center gap-2 px-5 py-2.5 bg-white text-primary hover:bg-slate-100 font-medium rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Back to System</span>
                        </Link>
                    </div>
                </div>

                {/* Grid Content Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TEMPLATES.map((item) => (
                        <Link key={item.href} href={item.href}
                            className="group relative flex flex-col p-6 bg-card rounded-2xl border border-border shadow-[var(--shadow-elevation-low)] hover:shadow-[var(--shadow-elevation-medium)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            {/* Hover Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            <div className="relative z-10 flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                    <item.icon size={24} strokeWidth={1.5} />
                                </div>
                                <span className="text-muted/30 group-hover:text-primary/50 transition-colors duration-300 transform group-hover:translate-x-1">
                                    <ArrowRight size={20} strokeWidth={2} />
                                </span>
                            </div>

                            <div className="relative z-10 mt-auto space-y-2">
                                <h3 className="font-sans text-xl font-medium text-heading group-hover:text-primary transition-colors duration-300">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-muted leading-relaxed line-clamp-2">
                                    {item.description}
                                </p>
                            </div>
                        </Link>
                    ))}

                    {/* New Card Placeholder (for future additions) */}
                    {TEMPLATES.length < 9 && (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-2xl text-center space-y-3 opacity-60 hover:opacity-100 hover:border-primary/50 transition-all duration-300 group cursor-default">
                            <div className="p-3 rounded-full bg-slate-50 text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-500">More Templates</h3>
                                <p className="text-xs text-slate-400">Coming soon</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="text-center pt-8 pb-4">
                    <p className="text-xs text-muted/50 uppercase tracking-widest font-medium">
                        Modern Minimal Luxury • v1.2.1
                    </p>
                </div>

            </div>
        </main>
    );
}
