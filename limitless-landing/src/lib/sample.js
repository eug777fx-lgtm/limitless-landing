// Sample account used in the product shots. Static numbers, clearly labelled as a sample.
const DAYS = [1, 2, 5, 7, 8, 9, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 26, 27, 28]
const NET = [420, -180, 610, 350, -520, 280, 220, -90, 410, -300, 520, 180, -640, 390, 90, 220, -150, -50, 380]
const MON = ['Oct']
let run = 0
export const EQUITY = [{ label: 'Oct 1', value: 0, sub: 0 }, ...DAYS.map((d, i) => { run += NET[i]; return { label: `${MON[0]} ${d}`, value: run, sub: NET[i] } })]
export const SAMPLE = {
  net: run, // 2,140
  target: 3000,
  trailing: 2500,
  dailyStop: 600,
  bestDay: 610,
  consistency: 610 / 2140,
  winRate: 0.54,
  pf: 1.6,
  trades: 61,
}
export const money = (v, sign = true) => {
  const s = '$' + Math.abs(Math.round(v)).toLocaleString('en-US')
  if (!sign) return (v < 0 ? '-' : '') + s
  return (v > 0 ? '+' : v < 0 ? '-' : '') + s
}
export const pct = (v) => Math.round(v * 100) + '%'
export const DAILY = DAYS.map((day, i) => ({ day, net: NET[i] }))
