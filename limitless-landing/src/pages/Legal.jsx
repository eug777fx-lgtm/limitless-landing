import { Link, usePageMeta, useReveal } from '../lib/site.jsx'
import { Backdrop } from '../components/ui.jsx'
import { PricingSection } from '../components/Pricing.jsx'

// Plain language drafts. Have them reviewed before relying on them.
const DOCS = {
  terms: {
    title: 'Terms of Service',
    updated: 'October 2026',
    sections: [
      ['The service', 'LIMITLESS is an online trading journal and analytics tool. It records the trades you enter and shows statistics about them. It does not place trades, hold funds or give financial advice.'],
      ['Your account', 'You need an account to use the journal. Keep your login private and tell us if you think someone else has access. You are responsible for activity on your account.'],
      ['Subscriptions', 'Lite costs $15 a month, billed in advance through Stripe. Your plan renews each month until you cancel. You can cancel anytime from your account, and you keep access until the end of the period you already paid for.'],
      ['Your data', 'The trades, notes and screenshots you add are yours. You can export them as a CSV file at any time. We only use them to run the service for you.'],
      ['Acceptable use', 'Do not misuse the service, try to break it, access other accounts or resell it. We may suspend accounts that do.'],
      ['No advice', 'Nothing in LIMITLESS is a recommendation to buy or sell anything. Trading futures and forex carries a substantial risk of loss and is not suitable for everyone. Past results, including your own, do not guarantee future results.'],
      ['Liability', 'The service is provided as is. To the extent the law allows, we are not liable for trading losses or for indirect damages arising from use of the service. Our total liability is limited to what you paid us in the last 12 months.'],
      ['Changes', 'We may update these terms. If a change is material we will tell you by email or in the app before it takes effect.'],
      ['Contact', 'Questions about these terms: support@limitless-journal.com.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'October 2026',
    sections: [
      ['What we collect', 'Your email address and name, the trades and notes you enter, screenshots you upload, and basic usage data needed to keep the app working.'],
      ['Payments', 'Payments are handled by Stripe. We never see or store your full card number. We keep a record of your plan and its status.'],
      ['How we use it', 'To run your journal, calculate your statistics, send the review emails you turn on, and answer support requests. We do not sell your data.'],
      ['Who can see your trades', 'Only you. Our team accesses account data only when needed to fix a problem or when you ask us to.'],
      ['Service providers', 'We use Supabase for the database and sign in, Vercel for hosting and Stripe for billing. They process data only on our behalf.'],
      ['Your choices', 'You can export your trades anytime. Write to us to request a copy of your data or to delete your account.'],
      ['Contact', 'Privacy questions: support@limitless-journal.com.'],
    ],
  },
  refunds: {
    title: 'Refund Policy',
    updated: 'October 2026',
    sections: [
      ['Cancel anytime', 'You can cancel your subscription anytime from your account. Cancelling stops the next renewal. You keep full access until the end of the period you paid for.'],
      ['Refunds', 'Monthly payments are not refunded for partial months. If you were charged by mistake or something went wrong on our side, write to us within 14 days of the charge and we will make it right.'],
      ['Your data after cancelling', 'Your trades stay saved, so you can pick up where you left off if you come back.'],
      ['Contact', 'Billing questions: support@limitless-journal.com.'],
    ],
  },
}

export function Legal({ doc }) {
  const d = DOCS[doc] || DOCS.terms
  usePageMeta(`${d.title} | LIMITLESS`, `${d.title} for LIMITLESS Trading Journal.`)
  useReveal()
  return (
    <div className="stage">
      <Backdrop orbs={[{ right: '8%', top: 80, width: 400, height: 400 }]} />
      <div className="wrap" style={{ maxWidth: 860, paddingBlock: '160px 110px' }}>
        <div className="col enter" style={{ gap: 14, marginBottom: 36 }}>
          <div className="row" style={{ '--i': 0, gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(DOCS).map(([k, v]) => <Link key={k} to={'/' + k} className={k === doc ? 'chip on' : 'chip'}>{v.title.replace(' of Service', '').replace(' Policy', '')}</Link>)}
          </div>
          <h1 className="h-lg" style={{ '--i': 1 }}>{d.title}</h1>
          <p className="faint" style={{ '--i': 2 }}>Last updated {d.updated}</p>
        </div>
        <div className="glass panel legal" style={{ padding: 'clamp(24px, 4vw, 44px)', gap: 28 }}>
          {d.sections.map(([h, p]) => (
            <section key={h} className="col" style={{ gap: 8 }}>
              <h2 style={{ fontSize: 19, fontWeight: 600 }}>{h}</h2>
              <p className="muted" style={{ lineHeight: 1.75 }}>{p}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PricingPage() {
  usePageMeta('Pricing | LIMITLESS Trading Journal', 'LIMITLESS Lite is $15 a month: unlimited trades, full analytics, psychology tracking and account rules. Pro is coming soon.')
  useReveal()
  return (
    <div className="stage">
      <Backdrop orbs={[{ left: '6%', top: 500, width: 420, height: 420 }]} />
      <div style={{ paddingTop: 70 }}><PricingSection as="div" id="plans" /></div>
      <div className="wrap" style={{ maxWidth: 1000, paddingBottom: 110 }}>
        <div className="grid g3">
          {[
            ['Cancel anytime', 'One click from your account. You keep access until the end of the month you paid for.'],
            ['Your data stays yours', 'Export every trade as CSV whenever you want. Nothing is shared.'],
            ['Secure checkout', 'Payments run through Stripe. We never see your card number.'],
          ].map(([t, b], i) => (
            <div key={t} className="well col" data-reveal style={{ '--i': i, borderRadius: 26, padding: 24, gap: 8 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600 }}>{t}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>{b}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
