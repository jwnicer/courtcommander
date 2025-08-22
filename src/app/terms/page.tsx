
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CourtIcon, RacketIcon } from '@/components/icons/badminton';

export default function TermsPage() {
    const effectiveDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            CourtCommander
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild>
                <Link href="/play?action=join">
                    Join a Session
                </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms & Conditions</CardTitle>
            <p className="text-muted-foreground">Effective Date: {effectiveDate}</p>
          </CardHeader>
          <CardContent className="prose prose-stone dark:prose-invert max-w-none space-y-6">
            <div className="p-4 bg-muted rounded-lg border border-border">
                <h3 className="font-bold text-lg">Plain-English Summary</h3>
                <p>This document sets the rules for participating in CourtCommander–organized open play sessions. Players accept all risks; organizers, queue masters ("QM"), and facilitators are not liable. We enforce a respectful, no-profanity culture, safety rules, and venue policies (no smoking, proper attire, etc.).</p>
            </div>

            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">1) Acceptance of Terms</h2>
                <p>By registering, checking in, or entering a CourtCommander session (the <strong>“Session”</strong>), you agree to these Terms & Conditions and any posted house rules. If you do not agree, do not participate.</p>
                <p><strong>Definitions:</strong> <strong>Player</strong> = registered participant. <strong>QM (Queue Master)</strong> = the person or role designated by CourtCommander to manage queues, courts, and compliance. <strong>Facilitator</strong> = any organizer, marshal, volunteer, or staff assisting the Session. <strong>Venue</strong> = location hosting the Session.</p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">2) Assumption of Risk (Players Bear All Risk)</h2>
                <p>Badminton and physical activity involve inherent risks, including but not limited to: slips, trips, collisions, falls, sprains/strains, overexertion, dehydration, cardiac events, concussions, eye injuries, shuttle or racket impacts, contact with other players, equipment failure, facility hazards, theft or damage to personal property, and actions/omissions of other persons.</p>
                <p><strong>You voluntarily assume all risks</strong> associated with participation, warm-ups, drills, spectating courtside, and use of any facility or equipment. You are solely responsible for determining your fitness to play and for obtaining medical clearance when appropriate.</p>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">3) Medical & Emergencies</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li>You certify you are physically able to participate and have disclosed relevant medical conditions to your own physician.</li>
                    <li>You must stop play if you feel unwell or unsafe.</li>
                    <li>In the event of an incident, Facilitators may call emergency services at their discretion. You authorize such assistance and agree you are responsible for all related costs.</li>
                    <li>First-aid provided (if any) is as-is, without warranty.</li>
                </ul>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">4) Release, Waiver, Limitation of Liability & Indemnity</h2>
                <p><strong>To the fullest extent permitted by law,</strong> you release and forever discharge CourtCommander, its owners, officers, employees, contractors, volunteers, Facilitators, QMs, partners, sponsors, and the Venue (collectively, the <strong>“Released Parties”</strong>) from any and all claims, liabilities, damages, losses, costs, or expenses (including attorneys’ fees) arising from injury, illness, death, or property damage related to your participation, whether caused by negligence or otherwise, except to the limited extent caused solely by the Released Parties’ willful misconduct or gross negligence where such limitation is not permitted by law.</p>
                <p>You agree to <strong>defend, indemnify, and hold harmless</strong> the Released Parties against any third-party claims arising from (a) your acts/omissions, (b) your breach of these Terms, or (c) your violation of law or Venue policies.</p>
                <p><strong>Limitation of Liability:</strong> The Released Parties’ aggregate liability, if any, shall not exceed the fees you paid for the specific Session giving rise to the claim.</p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">5) Eligibility; Minors</h2>
                 <ul className="list-disc pl-5 space-y-2">
                    <li>Players must comply with all registration requirements. False information is grounds for removal.</li>
                    <li><strong>Minors</strong> may participate only with a parent/legal guardian’s consent and supervision as required by Venue rules. The consenting adult accepts full responsibility and risk for the minor.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">6) Registration, Fees, Cancellations & Credits</h2>
                 <ul className="list-disc pl-5 space-y-2">
                    <li>Fees (if any) are due as posted. Your spot is not guaranteed until payment and check-in are complete.</li>
                    <li>Unless required by law or expressly stated in Session details, <strong>fees are non-refundable</strong>. At CourtCommander’s discretion, credits may be issued for Venue closures or force majeure (see §15).</li>
                    <li>CourtCommander may change Session times, formats, or capacities for safety or operational reasons.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">7) Operations & Authority (QM & Facilitators)</h2>
                 <ol className="list-decimal pl-5 space-y-2">
                    <li><strong>QM as Final Authority:</strong> The QM has full and final discretion over queues, court assignments, format (singles/doubles/rotations), timing, and enforcement of rules. Facilitators assist the QM. <strong>QM decisions are binding.</strong></li>
                    <li><strong>Queue & Court Management:</strong> Players must follow posted or announced systems (e.g., digital queue, name boards, capped game durations, rotation rules). Court/time limits may be adjusted to maximize play fairness and safety.</li>
                    <li><strong>Skill Balancing:</strong> CourtCommander may use ratings/history to create balanced matches. Players must provide accurate self-ratings; sandbagging or misrepresentation can result in reassignment or removal.</li>
                    <li><strong>Dispute Handling:</strong> Report disputes to the QM. The QM may pause or end matches, re-queue players, or impose penalties.</li>
                    <li><strong>Progressive Discipline:</strong> Warnings → queue demotion or temporary benching → removal from Session → temporary or permanent bans.</li>
                    <li><strong>Right to Refuse Service:</strong> CourtCommander may deny entry or remove any person to protect safety, fairness, or culture.</li>
                </ol>
            </section>

            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">8) Code of Conduct & Culture (Zero-Tolerance on Profanity)</h2>
                <p>CourtCommander maintains a <strong>respect-first culture</strong>. The following applies on courts, sidelines, common areas, and digital channels used for Sessions:</p>
                <h3 className="text-xl font-semibold mt-4">8.1 Respectful Communication (No Cursing/Profanity)</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Strictly prohibited:</strong> profanity, slurs, hate speech, discriminatory remarks, obscene gestures, bullying, intimidation, taunting, trash talk that targets individuals or groups, and any language reasonably likely to offend or escalate conflict.</li>
                    <li>Replace frustration with constructive communication (e.g., “Let’s replay,” “Nice try,” “Next rally”).</li>
                </ul>
                <h3 className="text-xl font-semibold mt-4">8.2 Sportsmanship & Safety</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li>No racket throwing, net abuse, or intentionally aggressive shots at people.</li>
                    <li>Yield right-of-way where collisions are likely; call “Mine/Yours” clearly.</li>
                    <li>Stop on “Let,” injury, or equipment failure.</li>
                </ul>
                <h3 className="text-xl font-semibold mt-4">8.3 Harassment & Misconduct</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Zero tolerance for harassment (verbal, physical, visual), sexual misconduct, stalking, or unwanted physical contact.</li>
                    <li>Report concerns to the QM immediately.</li>
                </ul>
                <h3 className="text-xl font-semibold mt-4">8.4 Integrity of Play</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Make honest line calls; resolve close calls by replay or as directed by the QM.</li>
                    <li>No cheating, score manipulation, or unauthorized coaching that disrupts balance.</li>
                </ul>
                <h3 className="text-xl font-semibold mt-4">8.5 Alcohol, Drugs & Doping</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li>No alcohol, illegal drugs, or impairment at the Venue. Performance-enhancing or banned substances are prohibited.</li>
                </ul>
                 <h3 className="text-xl font-semibold mt-4">8.6 Consequences</h3>
                <p>Violations may result in immediate ejection, suspension, bans, and forfeiture of fees. The QM’s decision is final for Session discipline.</p>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">9) Attire & Equipment</h2>
                 <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Proper attire required:</strong> athletic clothing and <strong>non-marking indoor court shoes</strong>. Players may be refused court entry without proper footwear.</li>
                    <li>Eye protection is recommended. Personal equipment must be safe and in good condition.</li>
                    <li>Players are responsible for their own equipment and any damage they cause to Venue property.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">10) Venue Rules & Safety</h2>
                 <ul className="list-disc pl-5 space-y-2">
                    <li><strong>No smoking or vaping</strong> anywhere inside the Venue or designated no-smoking areas.</li>
                    <li>Follow Venue-posted rules regarding food/drink, litter, parking, locker rooms, and spectators.</li>
                    <li>Keep aisles clear; bags should not block pathways.</li>
                    <li>CourtCommander and the Venue are <strong>not responsible for lost or stolen property</strong>.</li>
                </ul>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">11) Photography, Video & Media</h2>
                <p>Sessions may be photographed or recorded. By attending, you grant CourtCommander a non-exclusive, royalty-free license to use your image/likeness for Session operations and promotion, unless you opt out in writing <strong>before</strong> play. Unauthorized commercial filming is prohibited.</p>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">12) Data Privacy</h2>
                <p><strong>What we collect:</strong> identity and contact info, emergency contact, attendance/queue history, skill indicators/ratings, device and usage data, and payment confirmations (processed by third-party providers).</p>
                <p><strong>Why we process:</strong> account creation, scheduling, matchmaking, safety notifications, incident documentation, analytics to improve fairness, and compliance with law.</p>
                <p><strong>Sharing:</strong> with service providers (e.g., payments, messaging, analytics) under contracts; with authorities if legally required; with Venue solely for operational/safety needs.</p>
                <p><strong>Security & Retention:</strong> reasonable technical/organizational measures; retention only as necessary for the stated purposes or legal obligations.</p>
                <p><strong>Your rights:</strong> access, correction, deletion, objection/withdraw consent (where applicable). Contact <a href="mailto:privacy@courtcommander.com" className="text-primary hover:underline">privacy@courtcommander.com</a>. Cross-border transfers may occur subject to safeguards.</p>
                <p><strong>Marketing:</strong> you may opt-in/out of non-essential communications at any time.</p>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">13) Intellectual Property & Platform Use</h2>
                <p>All platform content, trademarks, and software are owned by CourtCommander or its licensors. You receive a limited, revocable, non-transferable license to use the platform solely for Session participation.</p>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">14) Lost & Found; Personal Property</h2>
                <p>CourtCommander does not take custody of personal property. Items left behind may be disposed of per Venue policy.</p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">15) Changes, Closures & Force Majeure</h2>
                <p>Sessions may be delayed, rescheduled, or canceled due to weather, utilities, Venue issues, public health directives, or other events beyond reasonable control. Remedies (if any) are limited to service re-performance or credits at CourtCommander’s discretion.</p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">16) Dispute Resolution; Governing Law</h2>
                 <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Governing Law:</strong> State of California, USA.</li>
                    <li><strong>Venue:</strong> Courts located in California, USA shall have exclusive jurisdiction.</li>
                    <li>Parties will first attempt good-faith resolution with the QM or an organizer before formal proceedings.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">17) Severability; Entire Agreement; Updates</h2>
                <p>If any provision is held invalid, the remainder remains in effect. These Terms constitute the entire agreement regarding Sessions and supersede prior statements. CourtCommander may update these Terms; continued participation after updates constitutes acceptance.</p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">18) Contact</h2>
                 <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Email:</strong> <a href="mailto:contact@courtcommander.com" className="text-primary hover:underline">contact@courtcommander.com</a></li>
                    <li><strong>Phone:</strong> 1-800-555-1234</li>
                    <li><strong>Mailing Address:</strong> 123 Shuttlecock Lane, San Francisco, CA 94107</li>
                 </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">19) Acknowledgment & Electronic Consent</h2>
                <p>By clicking “I Agree,” registering, or participating, you acknowledge you have read, understood, and agree to these Terms & Conditions, including the <strong>Zero-Tolerance on Profanity and Culture Standards</strong> and the <strong>QM’s final authority</strong> over Session operations and discipline.</p>
            </section>
          </CardContent>
        </Card>
      </main>
      
      <TooltipProvider>
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="secondary" size="icon" className="rounded-full shadow-lg">
                        <Link href="/qm">
                            <CourtIcon />
                            <span className="sr-only">Queue Master</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Queue Master</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="secondary" size="icon" className="rounded-full shadow-lg">
                        <Link href="/admin">
                            <RacketIcon />
                            <span className="sr-only">Admin Panel</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Admin Panel</p>
                </TooltipContent>
            </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
