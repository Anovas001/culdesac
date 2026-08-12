import Link from "next/link";
export default function Success() { return <main className="shell"><p className="eyebrow">PAGAMENT REBUT</p><h1>Estem confirmant la teva inscripció.</h1><p>Rebràs un correu de confirmació quan Stripe hagi notificat el pagament de manera segura.</p><Link href="/">Tornar al torneig</Link></main>; }
