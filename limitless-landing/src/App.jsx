import { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from 'react'
import {
  motion, AnimatePresence, useInView,
  useScroll, useTransform, useMotionValue, useSpring,
} from 'framer-motion'
import {
  BarChart2, BookOpen, Tag, Target, Menu, X, ChevronDown,
  Check, Star, Lock, Search, ArrowLeft, ArrowRight, Clock, Calendar,
} from 'lucide-react'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const NAV_LINKS = ['Features', 'Preview', 'Early Access', 'FAQ']

const STATS = [
  { to: 500,    suffix: '+', label: 'Beta Traders' },
  { to: 10000,  suffix: '+', label: 'Trades Tracked', format: (v) => v.toLocaleString() },
  { to: 74,     suffix: '%', label: 'Avg Win Rate' },
  { to: 0,      prefix: '$', label: 'To Get Started' },
]

const TESTIMONIALS = [
  { initials: 'MR', name: 'Marcus R.', role: 'Futures Trader', quote: 'LIMITLESS helped me cut my losing trades by 40% in 3 months. The pattern recognition is insane.' },
  { initials: 'SL', name: 'Sarah L.', role: 'Forex Trader', quote: 'Finally a journal that shows me the WHY behind my results, not just the numbers.' },
  { initials: 'JK', name: 'James K.', role: 'Crypto Trader', quote: 'The setup tagging system alone is worth the price. I found my A+ setup in week 2.' },
]

const FEATURES = [
  { icon: BarChart2, title: 'See What Makes You Money', desc: 'Deep performance analytics break down your P&L by time, setup, instrument, and psychology — so you know exactly what edge you have.' },
  { icon: BookOpen, title: 'Never Repeat Mistakes', desc: 'Log trades with screenshots, notes, and emotion tags. Review your journal to spot recurring errors before they cost you again.' },
  { icon: Tag, title: 'Find Your Best Setups', desc: 'Tag every trade with custom labels. Filter and compare setups to discover which configurations produce your highest R:R.' },
  { icon: Target, title: 'Build Consistency', desc: 'Set daily rules, track compliance, and score yourself on discipline. Consistency is the only edge that compounds.' },
]

const STEPS = [
  { num: '01', title: 'Log Trades', desc: 'Import from broker or log manually in seconds' },
  { num: '02', title: 'Analyze Performance', desc: 'Instantly see stats, charts, and breakdowns' },
  { num: '03', title: 'Fix Mistakes', desc: 'Identify patterns and recurring errors' },
  { num: '04', title: 'Grow Profits', desc: 'Apply insights and watch your edge compound' },
]

const FAQS = [
  { q: 'Is this for beginners?', a: "LIMITLESS is designed for serious traders of all levels. Whether you're 6 months in or 10 years deep, the journaling system adapts to your complexity." },
  { q: 'What markets are supported?', a: 'We support Futures, Forex, Crypto, and Stocks. You can track any instrument with a price — options support is coming soon.' },
  { q: 'Can I import trades from my broker?', a: 'Yes. We support CSV imports from major brokers and platforms including Tradovate, NinjaTrader, MetaTrader, and more. Direct API connections are in beta.' },
  { q: 'Is there a free version?', a: 'Yes — the Starter plan is free forever with up to 50 trades/month. No credit card required to get started.' },
  { q: 'How is my data protected?', a: 'All data is encrypted in transit and at rest. We never sell your trading data. You can export or delete your data at any time.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. No contracts, no hidden fees. Cancel your subscription in one click and your data remains accessible for 30 days.' },
]

const APP_URL = 'https://app.limitless-journal.com'

const smoothScrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://fngdbdcpfamcoctmdhyc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZ2RiZGNwZmFtY29jdG1kaHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzg1NjAsImV4cCI6MjA5MDgxNDU2MH0.WfHTTFZqBGXOTll3qcr9OOa5w2vXdurtYW-LL4tqhYY'
const SUPABASE_HEADERS = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
const SPOTS_TOTAL = 150

// Shared early-access capacity — drives the Apply → Waitlist auto-switch everywhere
const SpotsContext = createContext({ approvedCount: null, isFull: false, spotsTotal: SPOTS_TOTAL })
const useSpots = () => useContext(SpotsContext)

// ─── BLOG: ROUTING (state-based, no react-router) ────────────────────────────
const RouterContext = createContext({ route: { page: 'home' }, navigate: () => {} })
const useRouter = () => useContext(RouterContext)

function parseRoute(pathname) {
  if (/^\/blog\/?$/.test(pathname)) return { page: 'blog' }
  const m = pathname.match(/^\/blog\/([^/]+)\/?$/)
  if (m) return { page: 'article', slug: decodeURIComponent(m[1]) }
  return { page: 'home' }
}

// Per-page <title> + meta description for SPA SEO
function usePageMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title
    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', description)
    }
  }, [title, description])
}

// ─── BLOG: HELPERS ───────────────────────────────────────────────────────────
const slugify = (s) => s.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')

const hexA = (hex, a) => {
  const h = hex.replace('#', '')
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const n = parseInt(f, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

const CATEGORY_COLORS = {
  Psychology: '#a855f7',     // purple
  Performance: '#3b82f6',    // blue
  Strategy: '#22c55e',       // green
  Journaling: '#ffffff',     // white
  'Funded Trading': '#f5b531', // gold
}
const BLOG_CATEGORIES = ['All', 'Psychology', 'Performance', 'Strategy', 'Journaling', 'Funded Trading']

const articleWordCount = (content) => content.reduce((sum, b) => {
  let n = 0
  if (b.text) n += b.text.trim().split(/\s+/).length
  if (b.items) n += b.items.reduce((s, it) => s + it.trim().split(/\s+/).length, 0)
  return sum + n
}, 0)
const readTimeFor = (article) => `${Math.max(1, Math.round(articleWordCount(article.content) / 200))} min read`
const tocFor = (content) => content.filter(b => b.type === 'h2').map(b => ({ id: slugify(b.text), text: b.text }))
const relatedArticles = (article, n = 3) => {
  const others = ARTICLES.filter(a => a.slug !== article.slug)
  const same = others.filter(a => a.category === article.category)
  const rest = others.filter(a => a.category !== article.category)
  return [...same, ...rest].slice(0, n)
}

// ─── BLOG: ARTICLES ──────────────────────────────────────────────────────────
const ARTICLES = [
  {
    slug: 'how-to-keep-a-trading-journal',
    category: 'Journaling',
    title: 'How to Keep a Trading Journal (And Actually Stick to It)',
    date: 'June 10, 2026',
    excerpt: 'Most traders start a journal and quit within a week. Here is the system that makes it stick.',
    content: [
      { type: 'p', text: `Almost every trader has started a journal. Far fewer still have one a month later. The intention is always good — you finish a rough session, promise yourself you will track everything from now on, and for three or four days you actually do. Then a busy morning hits, you skip an entry, and the streak quietly dies. Journaling does not fail because traders are lazy. It fails because most journals are built like homework instead of like a tool. Here is the system that makes it stick.` },
      { type: 'h2', text: 'Why Most Traders Quit Within a Week' },
      { type: 'p', text: `The number one killer of a trading journal is friction. If logging a single trade takes ten minutes of copying numbers into a spreadsheet, your brain will find a reason to skip it the moment you are tired, frustrated, or busy — which, after a losing session, is exactly when you need the journal most.` },
      { type: 'p', text: `The second killer is vagueness. A journal full of entries like "bad trade, felt off" tells you nothing three weeks later. Without structure you accumulate pages of notes that never turn into a single decision. A journaling habit that survives removes friction and forces just enough structure to be useful — nothing more.` },
      { type: 'h2', text: 'What to Actually Log' },
      { type: 'p', text: `You do not need fifty fields. You need the handful that explain why a trade happened and how it felt while it did. For every trade, capture these five things:` },
      { type: 'ul', items: [
        'Entry and exit — price, time, size, and the instrument you traded.',
        'Reasoning — the setup or signal that made you click. One sentence is enough.',
        'Emotional state — calm, anxious, bored, revenge, FOMO. Be honest.',
        'Result — the dollar and R-multiple outcome, win or loss.',
        'One lesson — the single thing you would repeat or change next time.',
      ] },
      { type: 'p', text: `Those five fields turn a trade from a random event into a data point. The emotional state field is the one most traders skip and the one that ends up mattering most — your P&L lives downstream of your psychology, not the other way around.` },
      { type: 'h2', text: 'The 5-Minute Daily Review' },
      { type: 'p', text: `Logging trades is only half the habit. The other half is a short, repeatable review you run at the same time every day — ideally right after the session closes, while the trades are still fresh. Five minutes is enough. Read back through the trades you took, mark which ones followed your plan and which did not, and write one line summarizing the day. The goal is not to judge yourself. It is to close the loop between action and reflection while the memory is still accurate.` },
      { type: 'callout', text: `The traders who improve fastest are not the ones who journal the most detail. They are the ones who review the most consistently. A messy entry reviewed every day beats a perfect entry reviewed never.` },
      { type: 'h2', text: 'Turn Your Notes Into Patterns' },
      { type: 'p', text: `After thirty or forty trades, your journal stops being a diary and becomes a database. Now the real work begins: filtering. Sort your trades by setup and look at the win rate of each. Group them by emotional state and watch what happens to your results when you trade anxious versus calm. Break them down by time of day and you will almost always find a window where you give back everything you made in the morning. These patterns are invisible trade by trade and obvious in aggregate — which is the entire point of keeping the record.` },
      { type: 'related', slug: 'what-is-trading-edge', label: 'Once you can see your patterns, the next step is naming your edge' },
      { type: 'h2', text: 'Why LIMITLESS Makes It Effortless' },
      { type: 'p', text: `Every failure mode above comes down to friction and structure, and that is exactly what LIMITLESS is built to remove. Trades import in seconds, the five fields that matter are already there, and the daily review is a single screen instead of a spreadsheet hunt. Your emotional tags, setups, and results are tracked automatically, so the patterns surface on their own instead of waiting for you to build a pivot table. The habit sticks because the tool finally gets out of your way.` },
      { type: 'cta', text: 'Start journaling your trades today — free with early access.' },
    ],
  },
  {
    slug: 'why-traders-lose-money',
    category: 'Psychology',
    title: 'Why 90% of Traders Lose Money (It is Not What You Think)',
    date: 'June 12, 2026',
    excerpt: 'Bad setups are not why traders lose. The real reason is far more fixable.',
    content: [
      { type: 'p', text: `You have heard the statistic a hundred times: most retail traders lose money. The usual explanation is that they pick bad setups, trade without a strategy, or do not understand the markets. That explanation is comforting because it implies an easy fix — learn a better strategy and you will win. It is also mostly wrong. The traders blowing up their accounts are very often the same ones who can describe a clean setup in perfect detail. The problem is not knowledge. It is what happens between knowing the right move and actually making it.` },
      { type: 'h2', text: 'The Myth: Bad Setups Cause Losses' },
      { type: 'p', text: `Walk into any trading community and you will see endless debate about indicators, entry signals, and which strategy "actually works." Underneath it is the assumption that losing is an information problem — that if you just found the right setup, the losses would stop. But strategy is the most commoditized thing in trading. A profitable, well-documented edge can be learned in a weekend. If knowledge were the bottleneck, the failure rate would not be anywhere near as high as it is.` },
      { type: 'h2', text: 'The Truth: A Lack of Self-Awareness' },
      { type: 'p', text: `The real reason most traders lose is that they cannot see their own behavior clearly. They take a setup that works, then override it. They risk one percent on the trades they plan and five percent on the ones they take out of boredom. They remember their wins vividly and quietly forget the impulsive losses. Without an objective record, your memory edits the story until you are the disciplined trader you believe yourself to be — and the account balance keeps telling a different one.` },
      { type: 'h2', text: 'The Cycles That Drain Accounts' },
      { type: 'p', text: `Three behavioral loops do most of the damage, and every trader knows them by feel:` },
      { type: 'ul', items: [
        'Revenge trading — taking an immediate, oversized trade to win back a loss, turning one red trade into a red day.',
        'FOMO — chasing a move you missed because watching it run without you feels worse than the risk of a bad entry.',
        'Overconfidence — sizing up after a hot streak, right before the market mean-reverts and hands it all back.',
      ] },
      { type: 'p', text: `Notice that none of these are setup problems. They are emotional responses, and they repeat because they are invisible to the person having them in the moment.` },
      { type: 'h2', text: 'How Data Exposes Your Real Patterns' },
      { type: 'p', text: `The only reliable way to break a cycle you cannot feel is to make it visible after the fact. When you tag every trade with your emotional state and then look at the numbers, the story stops being subjective. You see that your revenge trades have a thirty percent win rate. You see that ninety percent of your worst losses happened in the hour after a loss. You see that your account does not have a strategy problem — it has a four-trades-after-noon problem. Data does not care about your story. It just shows you the pattern, which is the first step to interrupting it.` },
      { type: 'callout', text: `You cannot fix what you will not measure. The trader who tracks psychology is not more disciplined by nature — they just stopped flying blind.` },
      { type: 'h2', text: 'The Psychology Tracker Approach' },
      { type: 'p', text: `Treat your emotions as data, not noise. Tag each trade with how you felt entering it, review those tags weekly, and let the win rates per emotional state tell you which mental states you are allowed to trade in and which ones cost you money. Over time you stop trying to be more disciplined through willpower and start removing the specific conditions that trigger your worst decisions. Willpower runs out. A system does not.` },
      { type: 'related', slug: 'how-to-review-losing-trades', label: 'A structured loss review is where most of these patterns first show up' },
      { type: 'cta', text: 'Start tracking your trading psychology with LIMITLESS.' },
    ],
  },
  {
    slug: 'best-trading-journal-nq-futures',
    category: 'Performance',
    title: 'Best Trading Journal for NQ Futures Traders in 2026',
    date: 'June 14, 2026',
    excerpt: 'NQ futures traders have unique needs. Here is what to look for in a journal.',
    content: [
      { type: 'p', text: `NQ futures traders do not trade like everyone else, so a generic journal built for swing-trading stocks will always feel like the wrong tool. The Nasdaq 100 future moves fast, respects the session clock, and punishes sloppy risk management within minutes. If you trade NQ seriously — especially on a funded account — your journal needs to speak your language. Here is what actually matters when you choose one in 2026.` },
      { type: 'h2', text: 'What NQ Traders Actually Need to Track' },
      { type: 'p', text: `Trading NQ is a game of context. The same setup that prints in the first thirty minutes of the New York session can chop you to pieces at lunch. That means a useful journal has to capture more than entry and exit — it has to capture when and under what conditions you traded.` },
      { type: 'ul', items: [
        'Session and time block — Asia, London, the New York open, lunch, and power hour each behave differently.',
        'Key levels — the overnight high and low, prior day high and low, and the 9:30 cash open.',
        'Risk-to-reward — planned versus realized R on every position, not just the dollar result.',
        'Contract size and drawdown impact — especially when you are trading an evaluation account.',
      ] },
      { type: 'p', text: `Without these, your stats are an average of completely different games, and an average of different games tells you nothing about any of them.` },
      { type: 'h2', text: 'Generic Journals vs Purpose-Built Journals' },
      { type: 'p', text: `A general-purpose journal treats every market the same. You get a notes field, a P&L column, and a chart. That is fine for an investor checking in weekly. For an intraday futures trader it leaves out the entire structure of your day. You end up bolting on spreadsheets to track sessions and news, which reintroduces exactly the friction that kills journaling habits. A purpose-built futures journal bakes that context in from the start so you never have to leave it.` },
      { type: 'h2', text: 'The Features That Matter' },
      { type: 'p', text: `Three features separate a journal you will actually use from one you will abandon:` },
      { type: 'ul', items: [
        'Session analytics — automatic breakdowns of performance by time block so you can see your real edge window.',
        'An economic news calendar — so you know whether a loss came from a setup failing or from walking into CPI.',
        'Funded account compliance — live tracking of drawdown, daily loss limits, and profit targets against your prop firm rules.',
      ] },
      { type: 'p', text: `That last one is not optional if you trade an evaluation. A single trade that breaches a trailing drawdown can end a challenge you spent weeks passing, and no generic journal will warn you before it happens.` },
      { type: 'callout', text: `A journal that does not understand sessions, news, and drawdown is not a futures journal. It is a spreadsheet with a nicer font.` },
      { type: 'h2', text: 'Built for Futures Traders' },
      { type: 'p', text: `LIMITLESS was designed around the way futures traders actually work. Session analytics are automatic, so you can see at a glance that your New York open is carrying your entire month while lunch is quietly bleeding it. The built-in news calendar sits next to your trades, so high-impact events are context, not a surprise. And the funded account tracker monitors your drawdown and targets in real time against the rules of firms like Apex — so compliance is something you can see, not something you hope you remembered.` },
      { type: 'related', slug: 'how-to-pass-apex-funded-challenge', label: 'On an evaluation? This breaks down exactly how to use a journal to pass it' },
      { type: 'cta', text: 'Apply for early access to LIMITLESS — built for futures traders.' },
    ],
  },
  {
    slug: 'how-to-review-losing-trades',
    category: 'Performance',
    title: 'How to Review a Losing Trade (The Right Way)',
    date: 'June 16, 2026',
    excerpt: 'The difference between traders who improve and those who do not is how they handle losses.',
    content: [
      { type: 'p', text: `Every trader takes losses. The thing that separates the ones who get better from the ones who stay stuck is not how often they lose — it is what they do in the ten minutes after. Handle a loss badly and it becomes two losses, then a red day, then a habit. Handle it well and it becomes the single most valuable piece of feedback you will get all week. Reviewing a losing trade the right way is a skill, and like any skill it has a process.` },
      { type: 'h2', text: 'The Wrong Way to Review a Loss' },
      { type: 'p', text: `The default human response to a loss is emotional, and the default trading response is to act on that emotion immediately. You feel the sting, you decide the market owes you, and you size into the next setup to make it back. That is not a review — it is revenge, and it is how a manageable loss turns into the kind of day you do not want to log. The other wrong move is the opposite: closing the platform, refusing to look at the trade at all, and carrying a vague sense of failure into tomorrow. Both reactions skip the only useful step, which is understanding what actually happened.` },
      { type: 'h2', text: 'The Right Way: An Objective Process' },
      { type: 'p', text: `A good loss review is boring on purpose. You step away from the screen for a few minutes so the emotion drains out, then you come back and look at the trade like an analyst studying someone else's account. No story, no blame — just the sequence of decisions and whether each one was sound given what you knew at the time. The key reframe is this: a loss is not automatically a mistake. You can lose on a perfectly executed trade, and you can win on a reckless one. The review is about decision quality, not outcome.` },
      { type: 'h2', text: 'The Five Questions to Ask After Every Loss' },
      { type: 'ol', items: [
        'Was this a setup I had pre-defined, or did I improvise it in the moment?',
        'Did I size according to my risk plan, or did I push it?',
        'Was my entry where it should have been, or did I chase?',
        'Did I honor my stop, or did I move it once price went against me?',
        'What was my emotional state when I clicked — and did it influence the trade?',
      ] },
      { type: 'p', text: `Answer these honestly and the loss sorts itself into a category almost immediately.` },
      { type: 'h2', text: 'Categorize Every Loss' },
      { type: 'p', text: `Not all losses are equal, and lumping them together hides the signal. Sort each one into a bucket:` },
      { type: 'ul', items: [
        'Bias error — your read on direction or context was simply wrong.',
        'Entry error — right idea, bad execution or timing.',
        'Risk error — sizing or stop placement broke your rules.',
        'Psychology error — the trade only existed because of emotion.',
      ] },
      { type: 'p', text: `A trader losing to bias errors needs to work on analysis. A trader losing to psychology errors needs to work on themselves. They are completely different problems, and you can only tell them apart if you label them.` },
      { type: 'callout', text: `Outcome tells you whether you won. Category tells you why — and only the why is actionable.` },
      { type: 'h2', text: 'Build a Loss Pattern Database' },
      { type: 'p', text: `One categorized loss is a note. Fifty of them is a map. When you can pull up every risk error you have ever made and see they cluster on Fridays, or that every psychology error followed a previous loss within the hour, you stop guessing about what to fix. Consistent review turns scattered pain into a ranked to-do list, and working that list in order is what consistent improvement actually looks like.` },
      { type: 'related', slug: 'why-traders-lose-money', label: 'The deeper reason behind most psychology-category losses' },
      { type: 'cta', text: 'Log and review your next trade in LIMITLESS.' },
    ],
  },
  {
    slug: 'how-to-pass-apex-funded-challenge',
    category: 'Funded Trading',
    title: 'How to Pass Your Apex Funded Challenge Using a Trading Journal',
    date: 'June 17, 2026',
    excerpt: 'Most traders fail funded challenges not from bad trading — but from poor risk management and emotional decisions.',
    featured: true,
    content: [
      { type: 'p', text: `Passing an Apex evaluation is not primarily a trading problem. Plenty of traders who can read price perfectly well fail challenge after challenge, and it is almost never because their setups stopped working. They fail because an evaluation is a risk-management and discipline test wearing the costume of a trading test. Once you see it that way, a journal stops being optional and becomes the single most useful tool you have for getting funded. Here is how to use one to actually pass.` },
      { type: 'h2', text: 'The Apex Rules, Briefly' },
      { type: 'p', text: `Every funded program is a set of constraints, and you cannot manage what you have not clearly defined. An Apex evaluation comes down to three numbers: a profit target you need to reach, a trailing drawdown that follows your account up and ends you if you fall below it, and consistency expectations that stop you from passing on a single lucky day.` },
      { type: 'ul', items: [
        'Profit target — the cumulative gain you must reach to pass the evaluation.',
        'Trailing drawdown — a moving floor that trails your highest equity, realized and unrealized.',
        'Consistency — no single day can account for too large a share of your total profit.',
      ] },
      { type: 'p', text: `The trailing drawdown is the one that quietly kills most accounts. It moves up with your unrealized profit, so giving back a winner can breach you even though your balance never went negative on the day.` },
      { type: 'h2', text: 'Why Most Traders Fail' },
      { type: 'p', text: `The failure pattern is remarkably consistent, and none of it is about setups. A trader takes a normal loss, feels the drawdown tighten, and takes an immediate oversized trade to recover — turning a small dip into a breach. Or they have a great morning, get within reach of the target, and size up out of excitement right into a reversal that gives back days of progress. Revenge after losses and greed near the target are responsible for more failed challenges than bad analysis ever will be.` },
      { type: 'h2', text: 'The Daily Discipline System' },
      { type: 'p', text: `The fix is a small set of hard rules that take the in-the-moment decision out of your hands. The exact numbers depend on your account size, but the structure is what matters:` },
      { type: 'ul', items: [
        'Cap your trades — a maximum of two or three per day, full stop. Most damage happens on trade four.',
        'Halve your risk after a loss — never increase size to get it back. Smaller after red, not bigger.',
        'Set a daily stop — a fixed dollar or R loss that ends your day, no exceptions.',
        'Walk away at the target — once you hit your daily goal, you are done for the session.',
      ] },
      { type: 'p', text: `These rules feel restrictive precisely because they block the behavior that fails challenges. That is the point.` },
      { type: 'h2', text: 'Let the Journal Enforce the Rules' },
      { type: 'p', text: `Rules you keep in your head are rules you break under pressure. Rules in a journal are rules you can see. Logging every trade against your daily limits turns "I think I am doing okay" into "I have one trade left and I am at sixty percent of my daily stop." That visibility is what actually changes behavior in the moment, because the cost of breaking a rule is staring back at you before you click.` },
      { type: 'callout', text: `You do not rise to the level of your strategy in an evaluation. You fall to the level of your risk discipline — so make that discipline impossible to ignore.` },
      { type: 'h2', text: 'Track Drawdown and Project Your Payout' },
      { type: 'p', text: `Beyond enforcing rules, a journal lets you manage the account like a campaign instead of a series of disconnected days. When you track your trailing drawdown and average daily gain, you can project roughly how many clean sessions stand between you and the target — which kills the urgency that causes oversizing. There is no need to force it today when the math says steady wins get you there in two weeks.` },
      { type: 'h2', text: 'Score Process, Not Profit' },
      { type: 'p', text: `The traders who pass consistently judge their day on whether they followed their rules, not on whether they made money. A losing day where you honored every rule is a successful day. A winning day where you broke three rules is a warning. Scoring process over profit is what makes discipline durable enough to survive a real evaluation. LIMITLESS has a built-in funded account tracker designed for exactly this — live drawdown monitoring, daily limits, target projection, and a process score that tells you whether you are trading like someone who deserves to get funded.` },
      { type: 'related', slug: 'how-to-review-losing-trades', label: 'The review process that makes a process score honest' },
      { type: 'cta', text: 'Track your funded challenge with the LIMITLESS account tracker.' },
    ],
  },
  {
    slug: 'what-is-trading-edge',
    category: 'Strategy',
    title: 'What Is a Trading Edge and How Do You Find Yours?',
    date: 'June 18, 2026',
    excerpt: 'Every profitable trader has an edge. Most do not know what theirs actually is.',
    content: [
      { type: 'p', text: `Every consistently profitable trader has an edge. Ask them to define it precisely, though, and a surprising number cannot. They have a feel for what works, but feel is not an edge — it is a story you tell yourself between trades. A real edge is specific, measurable, and provable from your own data. If you cannot describe yours in a sentence backed by numbers, you do not yet know what is making you money, which means you cannot protect it or scale it. Here is how to find it.` },
      { type: 'h2', text: 'What an Edge Actually Is' },
      { type: 'p', text: `An edge is a statistical advantage: a repeatable situation where your expected value is positive over a large enough sample. That is it. It is not a secret indicator or a magic setup. It is the combination of how often you win, how much you win when you do, and how much you lose when you are wrong — applied to a specific, recurring market condition. An edge can be a modest win rate with large winners, or a high win rate with small ones. What makes it an edge is that the math comes out positive across many trades, not that any single trade feels good.` },
      { type: 'h2', text: 'Why Gut Feeling Is Not an Edge' },
      { type: 'p', text: `Intuition feels like an edge because your brain is a pattern-matching machine, and after enough screen time it genuinely picks up on real structure. The problem is that the same machine is hopelessly biased about its own track record. It remembers the gut call that nailed the top and forgets the five that did not. Until your feel is validated against a complete record, you cannot tell the difference between genuine pattern recognition and selective memory — and trading real size on the second one is how good runs end.` },
      { type: 'h2', text: 'Find Your Edge in Your Data' },
      { type: 'p', text: `Your edge is already in your trade history, waiting to be measured. The way to find it is to slice your results along the dimensions that define your trading and look for where your expectancy is clearly positive:` },
      { type: 'ul', items: [
        'By session and time of day — when are you actually making money?',
        'By setup — which named patterns carry your account and which just feel productive?',
        'By instrument — are you genuinely better on one market than the others you trade?',
        'By market condition — trend versus range, high versus low volatility.',
      ] },
      { type: 'p', text: `When you do this honestly, the result is almost always narrower than you expected. Most traders discover that a small slice of their activity produces nearly all of their profit, and the rest is noise that adds risk without adding return.` },
      { type: 'h2', text: 'The Minimum Sample Size' },
      { type: 'p', text: `One caveat ruins most self-analysis: you need enough trades for the numbers to mean anything. Ten trades tell you nothing — a coin flip can produce a ten-trade winning streak. Aim for at least fifty trades in a given category before you trust its win rate, and more if you can. This is exactly why the journaling habit matters. The edge is a property of the sample, and you cannot study a sample you never recorded.` },
      { type: 'callout', text: `An edge you cannot measure is a belief. An edge you can measure across fifty trades is an asset. The difference is a journal.` },
      { type: 'h2', text: 'Let the Analytics Reveal It' },
      { type: 'p', text: `This is where good analytics earn their keep. LIMITLESS automatically breaks your trades down by session, setup, instrument, and condition, and surfaces the expectancy of each — so your real edge stops being a hunch and becomes a number you can point to. Once you can see exactly where your money comes from, the strategy becomes obvious: do more of the slice that works, cut the slice that does not, and stop confusing activity with edge.` },
      { type: 'related', slug: 'how-to-keep-a-trading-journal', label: 'None of this works without the habit of logging every trade' },
      { type: 'cta', text: 'Discover your real edge with LIMITLESS analytics.' },
    ],
  },
]

// ─── BLOG: SHARED RESPONSIVE CSS ─────────────────────────────────────────────
const BLOG_CSS = `
  .blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 1024px) { .blog-grid { grid-template-columns: repeat(2, 1fr) !important; } }
  @media (max-width: 640px) { .blog-grid { grid-template-columns: 1fr !important; } }
  @media (max-width: 860px) {
    .featured-card { grid-template-columns: 1fr !important; }
    .ft-thumb { height: 200px !important; }
    .article-wrap { padding-left: 22px !important; padding-right: 22px !important; }
  }
  .blog-search::placeholder { color: #555; }
`

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const S = {
  bg: '#080808',
  card: '#0d0d0d',
  border: '#1f1f1f',
  text: '#ffffff',
  muted: '#888888',
  muted2: '#444444',
  radius: '14px',
  radiusSm: '10px',
}

// ─── GRAIN OVERLAY ───────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <svg
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, opacity: 0.03 }}
      aria-hidden="true"
    >
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  )
}

// ─── AURORA BLOBS ─────────────────────────────────────────────────────────────
function AuroraBlobs() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', top: '30%', right: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,220,255,0.025) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '20%', width: '55vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)', filter: 'blur(70px)' }} />
    </div>
  )
}

// ─── FADE IN ON SCROLL ────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, y = 24, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ─── ANIMATED SECTION (scroll-progress driven reveal) ────────────────────────
function AnimatedSection({ children, style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['0 1', '0.5 1'] })
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [40, 0])
  return (
    <motion.div ref={ref} style={{ opacity, y, ...style }}>
      {children}
    </motion.div>
  )
}

// ─── COUNT UP NUMBER ──────────────────────────────────────────────────────────
function CountUp({ to, prefix = '', suffix = '', format, duration = 1.5 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (to === 0) { setVal(0); return }
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(to * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return <span ref={ref}>{prefix}{format ? format(val) : val}{suffix}</span>
}

// ─── COUNT DOWN NUMBER ────────────────────────────────────────────────────────
function CountDown({ from, to, duration = 1.5, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [val, setVal] = useState(from)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(from + (to - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, from, to, duration])

  return <span ref={ref} style={style}>{val}</span>
}

// ─── MARQUEE TICKER ───────────────────────────────────────────────────────────
function Marquee() {
  const items = ['NQ', 'ES', 'EUR/USD', 'XAUUSD', 'GBP/USD', 'Futures', 'Forex', 'Funded Trading', 'ICT', 'Smart Money']
  const block = items.join(' · ') + ' · '

  return (
    <div style={{
      position: 'relative', zIndex: 1,
      height: '40px', display: 'flex', alignItems: 'center', overflow: 'hidden',
      borderTop: `1px solid #1f1f1f`, borderBottom: `1px solid #1f1f1f`,
      background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '120px', background: 'linear-gradient(90deg, #080808, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '120px', background: 'linear-gradient(270deg, #080808, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', whiteSpace: 'nowrap', flexShrink: 0, willChange: 'transform' }}
      >
        {[...Array(8)].map((_, i) => (
          <span key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', padding: '0 18px' }}>{block}</span>
        ))}
      </motion.div>
    </div>
  )
}

// ─── CURSOR EFFECT (desktop only) ─────────────────────────────────────────────
function CursorEffect() {
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)
  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)
  const ringX = useSpring(dotX, { damping: 22, stiffness: 240, mass: 0.5 })
  const ringY = useSpring(dotY, { damping: 22, stiffness: 240, mass: 0.5 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isDesktop = window.matchMedia('(min-width: 900px)').matches && !('ontouchstart' in window)
    if (!isDesktop) return
    setEnabled(true)
    document.documentElement.style.cursor = 'none'

    const move = (e) => { dotX.set(e.clientX); dotY.set(e.clientY) }
    const onOver = (e) => { if (e.target.closest('button, a, [role="button"]')) setHover(true) }
    const onOut  = (e) => { if (e.target.closest('button, a, [role="button"]')) setHover(false) }

    window.addEventListener('mousemove', move, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    return () => {
      document.documentElement.style.cursor = ''
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [dotX, dotY])

  if (!enabled) return null
  return (
    <>
      <motion.div style={{
        position: 'fixed', top: 0, left: 0, x: dotX, y: dotY,
        width: 6, height: 6, marginLeft: -3, marginTop: -3,
        borderRadius: '50%', background: '#fff',
        pointerEvents: 'none', zIndex: 99999, mixBlendMode: 'difference',
      }} />
      <motion.div
        animate={{ scale: hover ? 1.7 : 1, opacity: hover ? 0.8 : 0.5 }}
        transition={{ type: 'spring', damping: 18, stiffness: 220 }}
        style={{
          position: 'fixed', top: 0, left: 0, x: ringX, y: ringY,
          width: 36, height: 36, marginLeft: -18, marginTop: -18,
          borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.6)',
          pointerEvents: 'none', zIndex: 99998, mixBlendMode: 'difference',
        }}
      />
      <style>{`
        @media (max-width: 899px) { html { cursor: auto !important; } }
      `}</style>
    </>
  )
}

// ─── FLOATING PARTICLES ───────────────────────────────────────────────────────
function FloatingParticles() {
  const particles = [
    { left: '6%',  top: '14%', size: 2,   dur: 3.5, delay: 0 },
    { left: '92%', top: '10%', size: 1.5, dur: 4.2, delay: 1.2 },
    { left: '96%', top: '58%', size: 2,   dur: 3.8, delay: 0.6 },
    { left: '2%',  top: '75%', size: 1.5, dur: 4.6, delay: 2 },
    { left: '55%', top: '97%', size: 2,   dur: 3.2, delay: 1.5 },
    { left: '78%', top: '88%', size: 1,   dur: 5.1, delay: 0.3 },
  ]
  return (
    <div style={{ position: 'absolute', inset: '-40px', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -14, 0], opacity: [0.12, 0.45, 0.12] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', left: p.left, top: p.top, width: p.size, height: p.size, borderRadius: '50%', background: 'rgba(255,255,255,0.85)' }}
        />
      ))}
    </div>
  )
}

// ─── DASHBOARD MOCKUP ─────────────────────────────────────────────────────────
function DashboardMockup() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const rotX = useTransform(scrollYProgress, [0, 1], [8, 0])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 50, y: 60 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 1.1, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'relative', width: '100%', maxWidth: '760px' }}
    >
      {/* Ambient green glow */}
      <div style={{ position: 'absolute', top: '40%', left: '40%', transform: 'translate(-50%,-50%)', width: '110%', height: '110%', background: 'radial-gradient(ellipse at center, rgba(0,255,100,0.07) 0%, transparent 62%)', pointerEvents: 'none', zIndex: 0 }} />

      <FloatingParticles />

      {/* 3D floating window */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <motion.div style={{
          rotateX: rotX,
          rotateY: -10,
          transformPerspective: 1200,
          transformOrigin: 'center center',
          background: '#0b0b0b',
          border: '1px solid #272727',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 0 100px rgba(0,255,100,0.06), 0 60px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)',
        }}>

          {/* ── macOS title bar ── */}
          <div style={{ height: '30px', background: '#090909', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '10px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c841' }} />
            </div>
            <span style={{ fontSize: '9px', color: '#2c2c2c', letterSpacing: '0.2px' }}>LIMITLESS — Private Journal</span>
          </div>

          <img src="/dashboard2.png" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '0 0 12px 12px' }} />
        </motion.div>

        {/* Floating badge */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          style={{
            position: 'absolute', bottom: '-20px', left: '32px',
            background: 'rgba(6,6,6,0.92)',
            border: '1px solid rgba(74,222,128,0.3)',
            borderRadius: '100px', padding: '7px 18px 7px 12px',
            display: 'flex', alignItems: 'center', gap: '8px',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 0 28px rgba(74,222,128,0.12), 0 6px 24px rgba(0,0,0,0.55)',
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80', display: 'block', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#c8c8c8', fontWeight: 500, whiteSpace: 'nowrap' }}>Live Dashboard Preview</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar() {
  const { route, navigate } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      setVisible(y < lastY.current || y < 80)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll to a home-page section — navigate home first if we're elsewhere
  const scrollTo = (label) => {
    setMenuOpen(false)
    const id = label.toLowerCase().replace(/\s+/g, '-')
    if (route.page === 'home') {
      smoothScrollToId(id)
    } else {
      navigate('/')
      setTimeout(() => smoothScrollToId(id), 120)
    }
  }
  const goBlog = () => { setMenuOpen(false); navigate('/blog') }
  const goHome = () => { setMenuOpen(false); navigate('/') }
  const onBlog = route.page === 'blog' || route.page === 'article'

  const { isFull } = useSpots()
  const goWaitlist = () => {
    setMenuOpen(false)
    if (route.page === 'home') smoothScrollToId('waitlist')
    else { navigate('/'); setTimeout(() => smoothScrollToId('waitlist'), 120) }
  }
  const ctaClick = () => { isFull ? goWaitlist() : (window.location.href = APP_URL) }
  const ctaLabel = isFull ? 'Join the Waitlist' : 'Apply for Free Access'

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: '64px',
          background: scrolled ? 'rgba(8,8,8,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? `1px solid ${S.border}` : '1px solid transparent',
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={goHome}
        >
          <img src="/logo2.png" height="28" alt="Limitless logo" style={{ display: 'block' }} />
          <span style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.3px', color: S.text }}>LIMITLESS</span>
        </div>

        {/* Desktop center links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} className="nav-desktop">
          {NAV_LINKS.map(link => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              style={{ background: 'none', border: 'none', color: S.muted, fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = S.text}
              onMouseLeave={e => e.currentTarget.style.color = S.muted}
            >
              {link}
            </button>
          ))}
          <button
            onClick={goBlog}
            style={{ background: 'none', border: 'none', color: onBlog ? S.text : S.muted, fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = S.text}
            onMouseLeave={e => e.currentTarget.style.color = onBlog ? S.text : S.muted}
          >
            Blog
          </button>
        </div>

        {/* Desktop right CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="nav-desktop">
          <button
            onClick={() => window.location.href = APP_URL}
            style={{ background: 'none', border: `1px solid ${S.border}`, color: S.muted, fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: '7px 18px', borderRadius: '8px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = S.text }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.muted }}
          >
            Login
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={ctaClick}
            style={{ background: S.text, border: 'none', color: '#000', fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '8px 20px', borderRadius: '8px' }}
          >
            {ctaLabel}
          </motion.button>
        </div>

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="nav-mobile"
          style={{ background: 'none', border: 'none', color: S.text, cursor: 'pointer', padding: '6px', display: 'none' }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 998, background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(24px)', borderBottom: `1px solid ${S.border}`, padding: '12px 24px 24px', display: 'flex', flexDirection: 'column', gap: '2px' }}
          >
            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                style={{ background: 'none', border: 'none', color: S.text, fontSize: '16px', fontWeight: 500, cursor: 'pointer', padding: '14px 0', textAlign: 'left', borderBottom: `1px solid ${S.border}` }}
              >
                {link}
              </button>
            ))}
            <button
              onClick={goBlog}
              style={{ background: 'none', border: 'none', color: S.text, fontSize: '16px', fontWeight: 500, cursor: 'pointer', padding: '14px 0', textAlign: 'left', borderBottom: `1px solid ${S.border}` }}
            >
              Blog
            </button>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => window.location.href = APP_URL} style={{ flex: 1, background: 'none', border: `1px solid ${S.border}`, color: S.text, fontSize: '15px', fontWeight: 500, cursor: 'pointer', padding: '12px', borderRadius: '10px' }}>Login</button>
              <button onClick={ctaClick} style={{ flex: 1, background: S.text, border: 'none', color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer', padding: '12px', borderRadius: '10px' }}>{ctaLabel}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
      `}</style>
    </>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
const HEADLINE_LINES = [
  ['Turn', 'Your', 'Trades'],
  ['Into', 'Data.', 'Your'],
  ['Data', 'Into', 'Profit.'],
]

function Hero() {
  let wordIdx = 0
  const { isFull } = useSpots()

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 40px 80px',
      position: 'relative', zIndex: 1,
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
    }}>
      {/* Hero edge fade so dot grid feathers into surrounding bg */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, #080808 85%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '420px 1fr', gap: '56px', alignItems: 'center', position: 'relative', zIndex: 2 }} className="hero-grid">

        {/* Left text */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}>
            <motion.div
              animate={{ boxShadow: ['0 0 0 1px rgba(255,255,255,0.10), 0 0 18px rgba(255,255,255,0.06)', '0 0 0 1px rgba(255,255,255,0.22), 0 0 32px rgba(255,255,255,0.16)', '0 0 0 1px rgba(255,255,255,0.10), 0 0 18px rgba(255,255,255,0.06)'] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '100px', padding: '6px 16px', marginBottom: '28px' }}
            >
              <Lock size={12} color="#e5e5e5" style={{ display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#e5e5e5', fontWeight: 600, letterSpacing: '-0.1px' }}>
                {isFull
                  ? 'Beta Full — Waitlist Open'
                  : <>Early Access — <span style={{ color: S.muted, fontWeight: 500 }}>First 150 traders get priority approval</span></>}
              </span>
            </motion.div>
          </motion.div>

          <h1 style={{ fontSize: 'clamp(38px, 4.2vw, 56px)', fontWeight: 800, lineHeight: 1.07, letterSpacing: '-2.5px', color: S.text, margin: '0 0 22px' }}>
            {HEADLINE_LINES.map((line, li) => (
              <span key={li} style={{ display: 'block' }}>
                {line.map((word) => {
                  const i = wordIdx++
                  return (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.08 }}
                      style={{ display: 'inline-block', marginRight: '0.25em', willChange: 'transform, filter, opacity' }}
                    >
                      {word}
                    </motion.span>
                  )
                })}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: '17px', lineHeight: 1.65, color: S.muted, maxWidth: '380px', margin: '0 0 36px' }}
          >
            {isFull
              ? 'Beta is full. Subscriptions launching soon. Join the waitlist to be first in line.'
              : 'Apply for free access to LIMITLESS — a private trading journal built for serious traders. Limited spots available.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '18px' }}
          >
            {isFull ? (
              <WaitlistForm align="left" maxWidth="420px" />
            ) : (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => window.location.href = APP_URL}
                  style={{ background: S.text, border: 'none', color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer', padding: '13px 28px', borderRadius: '10px', letterSpacing: '-0.2px' }}>
                  Apply for Free Access →
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => smoothScrollToId('early-access')}
                  style={{ background: 'transparent', border: `1px solid ${S.border}`, color: S.text, fontSize: '15px', fontWeight: 500, cursor: 'pointer', padding: '13px 28px', borderRadius: '10px' }}>
                  See Preview
                </motion.button>
              </div>
            )}
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.5 }}
            style={{ fontSize: '12px', color: S.muted2 }}>
            {isFull
              ? "Beta is full — we'll email you the moment subscriptions open"
              : 'No payment required · Free during beta · Serious traders only'}
          </motion.p>
        </div>

        {/* Right mockup */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 0, position: 'relative', zIndex: 1, overflow: 'visible' }} className="hero-mockup">
          <div style={{ transform: 'scale(1.15)', transformOrigin: 'center center' }}>
            <DashboardMockup />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .hero-grid { grid-template-columns: 380px 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-mockup { display: none !important; }
        }
      `}</style>
    </section>
  )
}

// ─── SOCIAL PROOF ─────────────────────────────────────────────────────────────
function SocialProof() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '72px 40px', borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}` }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <FadeIn>
          <p style={{ textAlign: 'center', fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '44px' }}>
            Trusted by serious traders worldwide
          </p>
        </FadeIn>

        {/* Stats bar */}
        <FadeIn delay={0.08}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: S.border, borderRadius: S.radius, overflow: 'hidden', marginBottom: '48px' }} className="stats-grid">
            {STATS.map((s, i) => (
              <div key={i} style={{ background: S.bg, padding: '36px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', fontWeight: 800, color: S.text, letterSpacing: '-2px', marginBottom: '6px' }}>
                  <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} format={s.format} />
                </div>
                <div style={{ fontSize: '13px', color: S.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Testimonials */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="testimonial-grid">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: S.radius, padding: '24px', height: '100%' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#1a1a1a', border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: S.text, flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: S.text }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: S.muted }}>{t.role}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={12} fill={S.text} color={S.text} />)}
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.65, color: S.muted }}>"{t.quote}"</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .testimonial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ─── FEATURE CARD (with mouse spotlight) ──────────────────────────────────────
function FeatureCard({ feature, index }) {
  const Icon = feature.icon
  const ref = useRef(null)
  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)
  const [active, setActive] = useState(false)

  const onMouseMove = (e) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mouseX.set(e.clientX - r.left)
    mouseY.set(e.clientY - r.top)
  }

  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(260px circle at ${x}px ${y}px, rgba(255,255,255,0.08), transparent 60%)`
  )

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onMouseMove={onMouseMove}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'relative', background: S.card, border: `1px solid ${S.border}`, borderRadius: S.radius, padding: '32px 28px', height: '100%', overflow: 'hidden' }}
    >
      <motion.div
        aria-hidden="true"
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ position: 'absolute', inset: 0, background, pointerEvents: 'none', zIndex: 0 }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '11px', background: '#141414', border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <Icon size={20} color={S.text} />
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: S.text, letterSpacing: '-0.5px', marginBottom: '10px' }}>{feature.title}</h3>
        <p style={{ fontSize: '14px', lineHeight: 1.7, color: S.muted, margin: 0 }}>{feature.desc}</p>
      </div>
    </motion.div>
  )
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" style={{ position: 'relative', zIndex: 1, padding: '100px 40px' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '16px' }}>Features</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800, color: S.text, letterSpacing: '-2px', lineHeight: 1.1, margin: 0 }}>
              Everything You Need to<br />Improve Your Trading
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="features-grid">
          {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} index={i} />)}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section id="preview" style={{ position: 'relative', zIndex: 1, padding: '80px 40px 100px', borderTop: `1px solid ${S.border}` }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '16px' }}>How It Works</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800, color: S.text, letterSpacing: '-2px', margin: 0 }}>
              Simple. Powerful. Effective.
            </h2>
          </div>
        </FadeIn>

        <div style={{ position: 'relative' }}>
          {/* Connector line — draws itself */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ transformOrigin: 'left center', position: 'absolute', top: '27px', left: 'calc(12.5% + 28px)', right: 'calc(12.5% + 28px)', height: '1px', background: `linear-gradient(90deg, transparent, ${S.border} 15%, ${S.border} 85%, transparent)` }}
            className="step-line"
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', position: 'relative' }} className="steps-grid">
            {STEPS.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 8px' }}>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.3 + i * 0.12 }}
                  style={{ width: '54px', height: '54px', borderRadius: '50%', background: S.card, border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '13px', fontWeight: 700, color: S.text, boxShadow: `0 0 0 8px ${S.bg}` }}
                >
                  {step.num}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 + i * 0.12 }}
                >
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: S.text, marginBottom: '8px', letterSpacing: '-0.3px' }}>{step.title}</h3>
                  <p style={{ fontSize: '13px', lineHeight: 1.65, color: S.muted, margin: 0 }}>{step.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .step-line { display: none !important; }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ─── WAITLIST FORM ────────────────────────────────────────────────────────────
function WaitlistForm({ align = 'center', maxWidth = '440px' }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | already | error | invalid

  const submit = async (e) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setStatus('invalid'); return }
    setStatus('loading')
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: { ...SUPABASE_HEADERS, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ email: value }),
      })
      if (res.ok) { setStatus('success'); return }
      const data = await res.json().catch(() => ({}))
      if (res.status === 409 || data.code === '23505' || /duplicate/i.test(data.message || '')) setStatus('already')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ width: '100%', maxWidth, margin: align === 'center' ? '0 auto' : 0, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '12px', padding: '16px 20px', textAlign: align, color: '#7ee2a8', fontSize: '15px', fontWeight: 600 }}>
        You're on the list — we'll notify you at launch 🔥
      </div>
    )
  }

  const messages = {
    already: "You're already on the waitlist!",
    error: 'Something went wrong. Please try again.',
    invalid: 'Please enter a valid email address.',
  }

  return (
    <div style={{ width: '100%', maxWidth, margin: align === 'center' ? '0 auto' : 0 }}>
      <form onSubmit={submit} className="waitlist-form" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); if (status !== 'loading') setStatus('idle') }}
          placeholder="you@email.com"
          className="waitlist-input"
          style={{ flex: 1, minWidth: '200px', background: '#0d0d0d', border: `1px solid ${S.border}`, borderRadius: '10px', padding: '13px 16px', color: S.text, fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          onFocus={e => e.currentTarget.style.borderColor = '#444'}
          onBlur={e => e.currentTarget.style.borderColor = S.border}
        />
        <motion.button
          type="submit"
          disabled={status === 'loading'}
          whileHover={{ scale: status === 'loading' ? 1 : 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.22)', color: S.text, fontSize: '15px', fontWeight: 700, cursor: status === 'loading' ? 'default' : 'pointer', padding: '13px 26px', borderRadius: '10px', whiteSpace: 'nowrap', transition: 'border-color 0.2s, background 0.2s' }}
          onMouseEnter={e => { if (status !== 'loading') { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = '#1d1d1d' } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.background = '#161616' }}
        >
          {status === 'loading' ? 'Joining…' : 'Join the Waitlist'}
        </motion.button>
      </form>
      {messages[status] && (
        <p style={{ fontSize: '13px', color: status === 'already' ? '#f5b531' : '#ff6b6b', margin: '12px 0 0', textAlign: align }}>{messages[status]}</p>
      )}
      <style>{`
        .waitlist-input::placeholder { color: #555; }
        @media (max-width: 480px) {
          .waitlist-form { flex-direction: column; }
          .waitlist-form button { width: 100%; }
        }
      `}</style>
    </div>
  )
}

// ─── WAITLIST SECTION ─────────────────────────────────────────────────────────
function WaitlistSection() {
  return (
    <section id="waitlist" style={{ position: 'relative', zIndex: 1, padding: '80px 40px 100px', borderTop: `1px solid ${S.border}` }}>
      <FadeIn>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '16px' }}>Waitlist</p>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, color: S.text, letterSpacing: '-1.5px', lineHeight: 1.12, margin: '0 0 14px' }}>Miss the first 150? Join the waitlist.</h2>
          <p style={{ fontSize: '16px', color: S.muted, lineHeight: 1.6, margin: '0 0 32px' }}>We'll notify you the moment subscriptions open.</p>
          <WaitlistForm align="center" maxWidth="440px" />
        </div>
      </FadeIn>
    </section>
  )
}

// ─── EARLY ACCESS ─────────────────────────────────────────────────────────────
function EarlyAccess() {
  const { approvedCount, isFull, spotsTotal } = useSpots()

  const taken = approvedCount ?? 0
  const remaining = Math.max(0, spotsTotal - taken)
  const percentFilled = Math.min(100, (taken / spotsTotal) * 100)

  const bullets = [
    'Full access to every feature — no limits, no paywalls',
    'Your feedback shapes the product directly',
    'Lock in the lowest price before public launch',
    'Private community of serious traders',
    'Direct access to the founder',
  ]

  const steps = [
    { num: '1', title: 'Apply', desc: 'Click the button and submit your email' },
    { num: '2', title: 'Get Approved', desc: 'We review and approve serious traders only' },
    { num: '3', title: 'Start Journaling', desc: 'Full access, free, immediately' },
  ]

  return (
    <section id="early-access" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${S.border}` }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{
            position: 'relative',
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '20px',
            padding: '64px 56px',
            boxShadow: '0 0 90px rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }} className="ea-card">
            {/* Soft inner glow */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '44px' }}>
                <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '16px' }}>Early Access</p>
                <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800, color: S.text, letterSpacing: '-2px', lineHeight: 1.1, margin: '0 0 18px' }}>
                  Only 150 Traders Get In First.
                </h2>
                <p style={{ fontSize: '16px', color: S.muted, lineHeight: 1.65, maxWidth: '600px', margin: '0 auto' }}>
                  We're opening early access to a small group of serious traders. Free. In exchange for real feedback.
                </p>
              </div>

              {/* Spots counter */}
              <div style={{ maxWidth: '520px', margin: '0 auto 56px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: S.muted, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
                    {isFull
                      ? 'All spots taken — join waitlist'
                      : approvedCount === null
                        ? `${spotsTotal} spots remaining`
                        : <><CountDown key={`rem-${remaining}`} from={spotsTotal} to={remaining} /> spots remaining</>}
                  </span>
                  <span style={{ fontSize: '15px', color: S.text, fontWeight: 700, letterSpacing: '-0.3px' }}>
                    <span style={{ color: '#ff4d4d' }}>
                      <CountUp key={`take-${taken}`} to={taken} />
                    </span>
                    <span style={{ color: S.muted2 }}> / {spotsTotal} spots taken</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#161616', border: `1px solid ${S.border}`, borderRadius: '100px', overflow: 'hidden', marginBottom: '12px' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentFilled}%` }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #ff3d3d 0%, #ff6b4d 100%)', borderRadius: '100px', boxShadow: '0 0 14px rgba(255,77,77,0.55)' }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: S.muted2, textAlign: 'center', margin: 0 }}>
                  Spots are approved manually — not first come first served
                </p>
              </div>

              {/* Bullets */}
              <div style={{ marginBottom: '52px' }}>
                <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', fontWeight: 600, textAlign: 'center' }}>What you get</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '40px', rowGap: '14px', maxWidth: '760px', margin: '0 auto' }} className="ea-bullets">
                  {bullets.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                    >
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <Check size={11} color={S.text} strokeWidth={2.5} />
                      </div>
                      <span style={{ fontSize: '14px', color: '#d0d0d0', lineHeight: 1.6 }}>{b}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* How it works — 3 horizontal steps */}
              <div style={{ marginBottom: '48px' }}>
                <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '28px', fontWeight: 600, textAlign: 'center' }}>How it works</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }} className="ea-steps">
                  {steps.map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${S.border}`, borderRadius: '12px', padding: '24px 20px', textAlign: 'center' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#141414', border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: S.text, margin: '0 auto 14px' }}>
                        {s.num}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: S.text, marginBottom: '6px', letterSpacing: '-0.2px' }}>{s.title}</div>
                      <div style={{ fontSize: '13px', color: S.muted, lineHeight: 1.55 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ textAlign: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 0 60px rgba(255,255,255,0.22)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => isFull ? smoothScrollToId('waitlist') : (window.location.href = APP_URL)}
                  style={{ background: S.text, border: 'none', color: '#000', fontSize: '16px', fontWeight: 700, cursor: 'pointer', padding: '16px 36px', borderRadius: '12px', letterSpacing: '-0.2px', boxShadow: '0 0 40px rgba(255,255,255,0.12)', transition: 'box-shadow 0.3s' }}
                >
                  {isFull ? 'Join the Waitlist' : 'Apply for Free Access →'}
                </motion.button>
                <p style={{ fontSize: '12px', color: S.muted2, lineHeight: 1.55, maxWidth: '440px', margin: '20px auto 0' }}>
                  This is for active traders only. Not for beginners looking for signals.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ea-card { padding: 44px 24px !important; }
          .ea-bullets { grid-template-columns: 1fr !important; }
          .ea-steps { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${S.border}` }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '16px' }}>FAQ</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: S.text, letterSpacing: '-2px', margin: 0 }}>
              Frequently Asked Questions
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(13,13,13,0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${open === i ? 'rgba(255,255,255,0.18)' : S.border}`,
                borderRadius: S.radiusSm,
                overflow: 'hidden',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <motion.button
                layout="position"
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', gap: '16px' }}
              >
                <span style={{ fontSize: '15px', fontWeight: 600, color: S.text, letterSpacing: '-0.2px' }}>{faq.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.22 }}
                  style={{ color: S.muted, flexShrink: 0, display: 'flex' }}
                >
                  <ChevronDown size={18} />
                </motion.span>
              </motion.button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 24px 20px', borderTop: `1px solid ${S.border}` }}>
                      <p style={{ fontSize: '14px', lineHeight: 1.72, color: S.muted, paddingTop: '16px', margin: 0 }}>{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  const { isFull } = useSpots()
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '120px 40px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `linear-gradient(90deg, transparent, ${S.border} 30%, ${S.border} 70%, transparent)` }} />

      <FadeIn>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 800, color: S.text, letterSpacing: '-2.5px', lineHeight: 1.08, margin: '0 0 20px' }}>
            Start Taking Your Trading<br />Seriously Today
          </h2>
          <p style={{ fontSize: '17px', color: S.muted, lineHeight: 1.6, margin: '0 0 44px' }}>
            Join hundreds of traders already improving with LIMITLESS
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 60px rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => isFull ? smoothScrollToId('waitlist') : (window.location.href = APP_URL)}
            style={{ background: S.text, border: 'none', color: '#000', fontSize: '17px', fontWeight: 700, cursor: 'pointer', padding: '17px 44px', borderRadius: '13px', letterSpacing: '-0.3px', boxShadow: '0 0 40px rgba(255,255,255,0.12)', transition: 'box-shadow 0.3s' }}
          >
            {isFull ? 'Join the Waitlist →' : 'Apply for Free Access →'}
          </motion.button>
          <p style={{ fontSize: '13px', color: S.muted2, marginTop: '18px' }}>No payment required · Free during beta · Serious traders only</p>
        </div>
      </FadeIn>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  const { route, navigate } = useRouter()

  const scrollTo = (id) => {
    if (route.page === 'home') smoothScrollToId(id)
    else { navigate('/'); setTimeout(() => smoothScrollToId(id), 120) }
  }

  const linkStyle = { background: 'none', border: 'none', color: S.muted, fontSize: '13px', cursor: 'pointer', padding: '5px 0', textAlign: 'left', transition: 'color 0.2s', display: 'block', lineHeight: 1.5 }
  const hoverOn = e => e.currentTarget.style.color = S.text
  const hoverOff = e => e.currentTarget.style.color = S.muted
  const colHead = { fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, margin: '0 0 14px' }

  return (
    <footer style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${S.border}`, padding: '56px 40px 40px' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.6fr', gap: '40px', marginBottom: '44px' }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', cursor: 'pointer', width: 'fit-content' }} onClick={() => navigate('/')}>
              <img src="/logo2.png" height="24" alt="Limitless logo" style={{ display: 'block' }} />
              <span style={{ fontWeight: 700, fontSize: '15px', color: S.text, letterSpacing: '-0.2px' }}>LIMITLESS</span>
            </div>
            <p style={{ fontSize: '13px', color: S.muted2, margin: 0, lineHeight: 1.6, maxWidth: '240px' }}>The private trading journal built for serious futures and forex traders.</p>
          </div>

          {/* Product */}
          <div>
            <p style={colHead}>Product</p>
            <button style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff} onClick={() => scrollTo('features')}>Features</button>
            <button style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff} onClick={() => scrollTo('early-access')}>Early Access</button>
            <button style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff} onClick={() => scrollTo('faq')}>FAQ</button>
            <button style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff} onClick={() => navigate('/blog')}>Blog</button>
            <button style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff} onClick={() => window.location.href = APP_URL}>Login</button>
          </div>

          {/* Blog */}
          <div>
            <p style={colHead}>From the Blog</p>
            {ARTICLES.map(a => (
              <button key={a.slug} style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff} onClick={() => navigate(`/blog/${a.slug}`)}>{a.title}</button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: S.muted2, margin: 0 }}>© 2026 LIMITLESS. All rights reserved.</p>
          <p style={{ fontSize: '13px', color: S.muted2, margin: 0 }}>Built for serious traders</p>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  )
}

// ─── BLOG: CATEGORY THUMB (gradient "cover" with category accent) ─────────────
function CategoryThumb({ category, height = 170, big = false }) {
  const color = CATEGORY_COLORS[category] || '#888888'
  return (
    <div style={{
      position: 'relative', height, width: '100%', flexShrink: 0, overflow: 'hidden',
      background: `radial-gradient(circle at 28% 22%, ${hexA(color, 0.20)} 0%, transparent 58%), linear-gradient(135deg, #121212 0%, #0a0a0a 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderBottom: `1px solid ${S.border}`,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: color, boxShadow: `0 0 18px ${hexA(color, 0.6)}` }} />
      <span style={{ fontSize: big ? 'clamp(28px, 4vw, 40px)' : '22px', fontWeight: 800, letterSpacing: '-0.5px', color: hexA(color, color === '#ffffff' ? 0.85 : 0.92), textTransform: 'uppercase', textAlign: 'center', padding: '0 20px', lineHeight: 1.1 }}>{category}</span>
      <span style={{ position: 'absolute', bottom: '12px', left: '16px', fontSize: '9px', letterSpacing: '2px', color: S.muted2, textTransform: 'uppercase', fontWeight: 600 }}>LIMITLESS Journal</span>
    </div>
  )
}

// ─── BLOG: CATEGORY BADGE ────────────────────────────────────────────────────
function CategoryBadge({ category, small = false }) {
  const color = CATEGORY_COLORS[category] || '#888888'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: small ? '10px' : '11px', fontWeight: 700, letterSpacing: '0.5px', color: color === '#ffffff' ? '#fff' : color, background: hexA(color, 0.1), border: `1px solid ${hexA(color, 0.3)}`, borderRadius: '100px', padding: small ? '3px 10px' : '5px 13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${hexA(color, 0.8)}` }} />
      {category}
    </span>
  )
}

// ─── BLOG: ARTICLE CARD ──────────────────────────────────────────────────────
function ArticleCard({ article, index = 0 }) {
  const { navigate } = useRouter()
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/blog/${article.slug}`)}
      style={{ cursor: 'pointer', background: S.card, border: `1px solid ${S.border}`, borderRadius: S.radius, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', transition: 'border-color 0.25s, box-shadow 0.25s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.boxShadow = 'none' }}
    >
      <CategoryThumb category={article.category} height={170} />
      <div style={{ padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: '14px' }}><CategoryBadge category={article.category} small /></div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: S.text, letterSpacing: '-0.4px', lineHeight: 1.3, margin: '0 0 10px' }}>{article.title}</h3>
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: S.muted, margin: '0 0 18px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.excerpt}</p>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: S.muted2 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Clock size={12} /> {readTimeFor(article)}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Calendar size={12} /> {article.date}</span>
        </div>
        <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: 600, color: S.text, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Read Article <ArrowRight size={14} /></div>
      </div>
    </motion.article>
  )
}

// ─── BLOG: INDEX PAGE ────────────────────────────────────────────────────────
function BlogIndex() {
  usePageMeta(
    'The LIMITLESS Blog — Trading Insights for Serious Traders',
    'Trading insights, journal strategies, and performance breakdowns for serious traders. Journaling, psychology, funded trading, and how to find your edge.',
  )
  const { navigate } = useRouter()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const featured = useMemo(() => ARTICLES.find(a => a.featured) || ARTICLES[0], [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ARTICLES.filter(a => {
      const matchCat = category === 'All' || a.category === category
      const matchQ = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
      return matchCat && matchQ
    })
  }, [query, category])

  const showFeatured = category === 'All' && !query.trim()
  const gridArticles = showFeatured ? filtered.filter(a => a.slug !== featured.slug) : filtered

  return (
    <main style={{ position: 'relative', zIndex: 1 }}>
      {/* Hero */}
      <section style={{ padding: '150px 40px 24px', textAlign: 'center' }}>
        <FadeIn>
          <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '18px' }}>The Journal</p>
          <h1 style={{ fontSize: 'clamp(36px, 5.5vw, 60px)', fontWeight: 800, color: S.text, letterSpacing: '-2.5px', lineHeight: 1.05, margin: '0 0 20px' }}>The LIMITLESS Blog</h1>
          <p style={{ fontSize: '17px', color: S.muted, lineHeight: 1.6, maxWidth: '560px', margin: '0 auto' }}>Trading insights, journal strategies, and performance breakdowns for serious traders.</p>
        </FadeIn>
      </section>

      <section style={{ padding: '20px 40px 100px' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '460px', margin: '0 auto 28px' }}>
            <Search size={16} color={S.muted} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              className="blog-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search articles..."
              style={{ width: '100%', background: S.card, border: `1px solid ${S.border}`, borderRadius: '12px', padding: '13px 16px 13px 44px', color: S.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#444'}
              onBlur={e => e.currentTarget.style.borderColor = S.border}
            />
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '48px' }}>
            {BLOG_CATEGORIES.map(cat => {
              const active = category === cat
              const color = cat === 'All' ? '#ffffff' : (CATEGORY_COLORS[cat] || '#ffffff')
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '8px 16px', borderRadius: '100px',
                    border: `1px solid ${active ? hexA(color, 0.5) : S.border}`,
                    background: active ? hexA(color, 0.12) : 'transparent',
                    color: active ? (color === '#ffffff' ? '#fff' : color) : S.muted,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = S.text }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = S.muted }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Featured */}
          {showFeatured && (
            <FadeIn>
              <motion.article
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/blog/${featured.slug}`)}
                className="featured-card"
                style={{ cursor: 'pointer', display: 'grid', gridTemplateColumns: '1.1fr 1fr', background: S.card, border: `1px solid ${S.border}`, borderRadius: '18px', overflow: 'hidden', marginBottom: '48px', transition: 'border-color 0.25s, box-shadow 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="ft-thumb" style={{ height: '100%' }}>
                  <CategoryThumb category={featured.category} height="100%" big />
                </div>
                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#000', background: '#fff', borderRadius: '100px', padding: '4px 10px' }}>Featured</span>
                    <CategoryBadge category={featured.category} small />
                  </div>
                  <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, color: S.text, letterSpacing: '-1px', lineHeight: 1.2, margin: '0 0 14px' }}>{featured.title}</h2>
                  <p style={{ fontSize: '15px', lineHeight: 1.65, color: S.muted, margin: '0 0 22px', maxWidth: '440px' }}>{featured.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: S.muted2, marginBottom: '24px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Clock size={13} /> {readTimeFor(featured)}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} /> {featured.date}</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: S.text, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>Read Article <ArrowRight size={15} /></span>
                </div>
              </motion.article>
            </FadeIn>
          )}

          {/* Grid */}
          {gridArticles.length > 0 ? (
            <div className="blog-grid" style={{ gap: '20px' }}>
              {gridArticles.map((a, i) => <ArticleCard key={a.slug} article={a} index={i} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: S.muted }}>
              <p style={{ fontSize: '16px', margin: '0 0 6px', color: S.text, fontWeight: 600 }}>No articles found</p>
              <p style={{ fontSize: '14px', margin: 0 }}>Try a different search or category.</p>
            </div>
          )}
        </div>
      </section>
      <style>{BLOG_CSS}</style>
    </main>
  )
}

// ─── BLOG: READING PROGRESS BAR ──────────────────────────────────────────────
function ReadingProgressBar({ color = '#ffffff' }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  return (
    <motion.div
      aria-hidden="true"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', transformOrigin: '0%', scaleX, background: color, boxShadow: `0 0 12px ${hexA(color, 0.7)}`, zIndex: 1001 }}
    />
  )
}

// ─── BLOG: ARTICLE PAGE ──────────────────────────────────────────────────────
function ArticlePage({ slug }) {
  const { navigate } = useRouter()
  const { isFull } = useSpots()
  // When the beta is full, article CTAs route to the home-page waitlist instead of the app
  const ctaAction = () => {
    if (isFull) { navigate('/'); setTimeout(() => smoothScrollToId('waitlist'), 120) }
    else window.location.href = APP_URL
  }
  const ctaText = isFull ? 'Join the Waitlist →' : 'Apply for Free Access →'
  const article = ARTICLES.find(a => a.slug === slug)

  usePageMeta(
    article ? `${article.title} — LIMITLESS Blog` : 'Article Not Found — LIMITLESS Blog',
    article ? article.excerpt : 'The article you are looking for could not be found.',
  )

  useEffect(() => { window.scrollTo(0, 0) }, [slug])

  if (!article) {
    return (
      <section style={{ position: 'relative', zIndex: 1, minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '140px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: S.text, letterSpacing: '-1px', margin: '0 0 14px' }}>Article not found</h1>
        <p style={{ fontSize: '15px', color: S.muted, margin: '0 0 28px' }}>The article you are looking for does not exist or has moved.</p>
        <button onClick={() => navigate('/blog')} style={{ background: S.text, border: 'none', color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer', padding: '13px 28px', borderRadius: '11px' }}>← Back to Blog</button>
      </section>
    )
  }

  const color = CATEGORY_COLORS[article.category] || '#ffffff'
  const toc = tocFor(article.content)
  const related = relatedArticles(article, 3)

  const renderBlock = (block, i) => {
    switch (block.type) {
      case 'h2':
        return <h2 key={i} id={slugify(block.text)} style={{ fontSize: 'clamp(26px, 3.4vw, 32px)', fontWeight: 800, color: S.text, letterSpacing: '-0.8px', lineHeight: 1.25, margin: '50px 0 18px', scrollMarginTop: '90px' }}>{block.text}</h2>
      case 'h3':
        return <h3 key={i} id={slugify(block.text)} style={{ fontSize: '24px', fontWeight: 700, color: S.text, letterSpacing: '-0.5px', lineHeight: 1.3, margin: '36px 0 14px', scrollMarginTop: '90px' }}>{block.text}</h3>
      case 'p':
        return <p key={i} style={{ fontSize: '18px', lineHeight: 1.8, color: '#c4c4c4', margin: '0 0 22px' }}>{block.text}</p>
      case 'ul':
        return (
          <ul key={i} style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {block.items.map((it, j) => (
              <li key={j} style={{ display: 'flex', gap: '12px', fontSize: '18px', lineHeight: 1.7, color: '#c4c4c4' }}>
                <span style={{ flexShrink: 0, marginTop: '11px', width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        )
      case 'ol':
        return (
          <ol key={i} style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {block.items.map((it, j) => (
              <li key={j} style={{ display: 'flex', gap: '14px', fontSize: '18px', lineHeight: 1.7, color: '#c4c4c4' }}>
                <span style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: '#141414', border: `1px solid ${S.border}`, color: S.text, fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>{j + 1}</span>
                <span>{it}</span>
              </li>
            ))}
          </ol>
        )
      case 'callout':
        return <div key={i} style={{ background: '#0d0d0d', borderLeft: `3px solid ${color}`, borderTop: `1px solid ${S.border}`, borderRight: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}`, borderRadius: '0 12px 12px 0', padding: '20px 24px', margin: '32px 0', fontSize: '18px', lineHeight: 1.7, color: '#e6e6e6', fontWeight: 500 }}>{block.text}</div>
      case 'related': {
        const target = ARTICLES.find(a => a.slug === block.slug)
        if (!target) return null
        const tcolor = CATEGORY_COLORS[target.category] || '#888888'
        return (
          <button key={i} onClick={() => navigate(`/blog/${target.slug}`)} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', textAlign: 'left', cursor: 'pointer', background: hexA(tcolor, 0.06), border: `1px solid ${hexA(tcolor, 0.25)}`, borderRadius: '12px', padding: '16px 20px', margin: '28px 0', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = hexA(tcolor, 0.12)}
            onMouseLeave={e => e.currentTarget.style.background = hexA(tcolor, 0.06)}>
            <span style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: tcolor === '#ffffff' ? '#fff' : tcolor, fontWeight: 700 }}>Related Reading</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: S.text, display: 'inline-flex', alignItems: 'center', gap: '8px', lineHeight: 1.4 }}>{block.label || target.title} <ArrowRight size={15} style={{ flexShrink: 0 }} /></span>
          </button>
        )
      }
      case 'cta':
        return (
          <div key={i} style={{ textAlign: 'center', background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255,255,255,0.06), transparent 70%)', border: `1px solid ${S.border}`, borderRadius: '16px', padding: '36px 28px', margin: '40px 0 8px' }}>
            <p style={{ fontSize: '18px', fontWeight: 600, color: S.text, margin: '0 0 18px', lineHeight: 1.4 }}>{block.text}</p>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={ctaAction} style={{ background: S.text, border: 'none', color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer', padding: '13px 30px', borderRadius: '11px' }}>{ctaText}</motion.button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <ReadingProgressBar color={color} />

      <article className="article-wrap" style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', padding: '120px 40px 60px' }}>
        {/* Back */}
        <button onClick={() => navigate('/blog')} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '14px', fontWeight: 500, padding: 0, marginBottom: '28px', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = S.text}
          onMouseLeave={e => e.currentTarget.style.color = S.muted}>
          <ArrowLeft size={16} /> Blog
        </button>

        {/* Header */}
        <div style={{ marginBottom: '18px' }}><CategoryBadge category={article.category} /></div>
        <h1 style={{ fontSize: 'clamp(30px, 4.8vw, 44px)', fontWeight: 800, color: S.text, letterSpacing: '-1.5px', lineHeight: 1.12, margin: '0 0 24px' }}>{article.title}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', paddingBottom: '32px', borderBottom: `1px solid ${S.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#161616', border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo2.png" height="18" alt="" style={{ display: 'block' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: S.text }}>LIMITLESS Team</div>
              <div style={{ fontSize: '12px', color: S.muted2 }}>Author</div>
            </div>
          </div>
          <span style={{ width: '1px', height: '24px', background: S.border }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: S.muted }}><Calendar size={14} /> {article.date}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: S.muted }}><Clock size={14} /> {readTimeFor(article)}</span>
        </div>

        {/* Table of contents */}
        {toc.length > 0 && (
          <nav style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '14px', padding: '22px 24px', margin: '32px 0 12px' }}>
            <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, margin: '0 0 14px' }}>In This Article</p>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {toc.map((t, i) => (
                <li key={t.id}>
                  <button onClick={() => document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', color: S.muted, fontSize: '14px', lineHeight: 1.4, display: 'flex', gap: '10px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = S.text}
                    onMouseLeave={e => e.currentTarget.style.color = S.muted}>
                    <span style={{ color: S.muted2, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
                    <span>{t.text}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Body */}
        <div style={{ marginTop: '8px' }}>
          {article.content.map(renderBlock)}
        </div>
      </article>

      {/* Related */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${S.border}`, padding: '64px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '13px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 28px', fontWeight: 600 }}>Related Articles</h2>
          <div className="blog-grid" style={{ gap: '20px' }}>
            {related.map((a, i) => <ArticleCard key={a.slug} article={a} index={i} />)}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 40px 110px', textAlign: 'center', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.05), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, color: S.text, letterSpacing: '-1.5px', lineHeight: 1.15, margin: '0 0 18px' }}>Start journaling your trades today</h2>
          <p style={{ fontSize: '16px', color: S.muted, lineHeight: 1.6, margin: '0 0 32px' }}>Join the serious traders using LIMITLESS to track every trade, fix every mistake, and build a real edge.</p>
          <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(255,255,255,0.18)' }} whileTap={{ scale: 0.97 }} onClick={ctaAction} style={{ background: S.text, border: 'none', color: '#000', fontSize: '16px', fontWeight: 700, cursor: 'pointer', padding: '15px 36px', borderRadius: '12px', boxShadow: '0 0 40px rgba(255,255,255,0.1)' }}>{ctaText}</motion.button>
        </div>
      </section>
      <style>{BLOG_CSS}</style>
    </>
  )
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
// ─── HOMEPAGE BLOG PREVIEW (3 latest articles) ───────────────────────────────
function BlogPreview() {
  const { navigate } = useRouter()
  const latest = useMemo(() => [...ARTICLES].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3), [])

  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${S.border}` }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <div>
              <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '14px' }}>Insights</p>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: S.text, letterSpacing: '-2px', lineHeight: 1.1, margin: 0 }}>From the Blog</h2>
            </div>
            <button
              onClick={() => navigate('/blog')}
              style={{ background: 'none', border: 'none', color: S.text, fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 0', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              View all articles <ArrowRight size={15} />
            </button>
          </div>
        </FadeIn>

        <div className="blog-grid" style={{ gap: '20px' }}>
          {latest.map((a, i) => <ArticleCard key={a.slug} article={a} index={i} />)}
        </div>
      </div>
      <style>{BLOG_CSS}</style>
    </section>
  )
}

function HomePage() {
  usePageMeta(
    'LIMITLESS — Trading Journal for Serious Traders',
    'The private trading journal built for serious futures and forex traders. Track trades, analyze performance, fix mistakes, and become consistent. Early access open.',
  )
  return (
    <>
      <Hero />
      <Marquee />
      <AnimatedSection><SocialProof /></AnimatedSection>
      <AnimatedSection><Features /></AnimatedSection>
      <AnimatedSection><HowItWorks /></AnimatedSection>
      <AnimatedSection><EarlyAccess /></AnimatedSection>
      <AnimatedSection><WaitlistSection /></AnimatedSection>
      <AnimatedSection><FAQ /></AnimatedSection>
      <AnimatedSection><BlogPreview /></AnimatedSection>
      <AnimatedSection><FinalCTA /></AnimatedSection>
    </>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [route, setRoute] = useState(() => (typeof window !== 'undefined' ? parseRoute(window.location.pathname) : { page: 'home' }))
  const [approvedCount, setApprovedCount] = useState(null)

  useEffect(() => {
    const onPop = () => setRoute(parseRoute(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Fetch approved-user count once — drives the Apply → Waitlist auto-switch
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?status=eq.approved&select=id`, { headers: SUPABASE_HEADERS })
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) setApprovedCount(data.length)
      } catch {
        if (!cancelled) setApprovedCount(0)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const navigate = useCallback((path) => {
    if (path === window.location.pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    window.history.pushState({}, '', path)
    setRoute(parseRoute(path))
    window.scrollTo({ top: 0 })
  }, [])

  const spots = useMemo(() => ({
    approvedCount,
    isFull: (approvedCount ?? 0) >= SPOTS_TOTAL,
    spotsTotal: SPOTS_TOTAL,
  }), [approvedCount])

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      <SpotsContext.Provider value={spots}>
        <div style={{ background: S.bg, minHeight: '100vh', position: 'relative' }}>
          <GrainOverlay />
          <AuroraBlobs />
          <CursorEffect />
          <Navbar />
          {route.page === 'home' && <HomePage />}
          {route.page === 'blog' && <BlogIndex />}
          {route.page === 'article' && <ArticlePage slug={route.slug} />}
          <Footer />
        </div>
      </SpotsContext.Provider>
    </RouterContext.Provider>
  )
}
