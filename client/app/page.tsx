'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  CreditCard,
  TrendingUp,
  Shield,
  Zap,
  PieChart,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  BarChart3,
  Wallet
} from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">Fold</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
              <Link href="/dashboard">
                Dashboard
              </Link>
            </Button>

            <SignedOut>
              <SignInButton mode="modal">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600"
            >
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Account Aggregator Powered
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl"
            >
              Be painfully{' '}
              <span className="text-blue-600">aware</span>
              .
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
            >
              Fold securely connects to your Bank accounts and gives a clear picture
              of your finances. Make better decisions and lead a healthier financial life.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-4"
            >
              <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90" asChild>
                <Link href="/link">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Connect your Bank
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border" asChild>
                <Link href="/dashboard">
                  View Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-8"
            >
              {[
                'No email scraping',
                'No SMS scraping',
                'Bank-grade security',
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {badge}
                </div>
              ))}
            </motion.div>

            {/* Preview Cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-16 w-full max-w-4xl"
            >
              <div className="rounded-2xl border border-border bg-white p-6 shadow-lg">
                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    { label: 'Total Balance', value: '₹2,24,460', change: '+12.5%', positive: true },
                    { label: 'Income', value: '₹85,000', change: '+8.2%', positive: true },
                    { label: 'Expenses', value: '₹36,800', change: '-5.3%', positive: true },
                    { label: 'Savings', value: '₹48,200', change: '+15.8%', positive: true },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</p>
                      <p className={`mt-1 text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>
                        {stat.change} vs last month
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Never visit your Bank&apos;s website again
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Fold automatically pulls your expenses from your Bank accounts and categorizes them.
              No more manual tracking.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: CreditCard,
                title: 'All accounts in one place',
                description: 'Connect all your bank accounts and see everything in a unified dashboard.',
              },
              {
                icon: Zap,
                title: 'AI-powered categorization',
                description: 'Transactions are automatically tagged. No more manual expense tracking.',
              },
              {
                icon: PieChart,
                title: 'Spending insights',
                description: 'Visualize where your money goes with intuitive charts and analytics.',
              },
              {
                icon: TrendingUp,
                title: 'Subscription tracking',
                description: 'Find recurring payments and hidden subscriptions automatically.',
              },
              {
                icon: Shield,
                title: 'Bank-grade security',
                description: 'Your data is encrypted end-to-end. We never store your credentials.',
              },
              {
                icon: BarChart3,
                title: 'Smart recommendations',
                description: 'Get personalized tips to save more and spend wisely.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-white p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Get started in 3 simple steps
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Connect', desc: 'Link your bank accounts securely via Account Aggregator' },
              { step: '2', title: 'Sync', desc: 'Your transactions are fetched and categorized automatically' },
              { step: '3', title: 'Insights', desc: 'Get AI-powered insights and spending analytics' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl bg-primary p-10 md:p-14 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Ready to take control?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of users who have already connected their bank accounts.
            </p>
            <Button size="lg" className="mt-8 bg-white text-primary hover:bg-white/90 h-12 px-8" asChild>
              <Link href="/link">
                Get Started — It&apos;s Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-white">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-muted-foreground">Fold © 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Blog</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
