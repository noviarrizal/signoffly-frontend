import type { LegalFacts, Section } from "@/content/legal-types";

/** The Terms of Service. The numbers come from the product (free limits, pass length) and the decisions in docs/legal-review.md. */
export function termsSections(f: LegalFacts): Section[] {
  return [
    {
      id: "agreement",
      title: "Who we are and what you agree to",
      blocks: [
        `${f.product} is run by ${f.operatorName} ("we", "us"). By creating an account or using the service you agree to these terms and to our Privacy Policy. If you do not agree, do not use ${f.product}.`,
        "You must be at least 18, or old enough to make a binding contract where you live, to use the service.",
      ],
    },
    {
      id: "service",
      title: "What the service does",
      blocks: [
        `${f.product} reads a public GitHub repository that you name, runs automated checks, and gives you a report with findings, a score and a verdict, plus a prompt you can use to fix each finding. It never runs your code. For now it supports public repositories only, and JavaScript and TypeScript projects for most checks.`,
        "The service is new. Features, limits and prices can change, and some checks may be added or removed.",
      ],
    },
    {
      id: "results",
      title: "What the results are, and are not",
      blocks: [
        "Reports are automated. They can miss problems (false negatives) and report problems that are not real (false positives). A verdict of Signed off means our checks found nothing blocking, not that your app is secure, correct or lawful.",
        "Legal and privacy findings are signals for you to review. They are not legal advice, and we are not a law firm. Ask a qualified professional before you rely on them.",
        "Testing and code quality findings are judged from file names and text, not from running your code or measuring coverage.",
        "You decide what to do with a report, and you are responsible for your own app.",
      ],
    },
    {
      id: "account",
      title: "Your account",
      blocks: [
        "You sign in with GitHub. Keep your access secure and do not share your account. You are responsible for what happens under it. Tell us if you think someone else is using it.",
        "Give us accurate information, including a working email address.",
      ],
    },
    {
      id: "use",
      title: "Using the service fairly",
      blocks: [
        "You agree not to:",
        {
          list: [
            "scan a repository in order to harass, attack or harm its owner, or to find a weakness to exploit it",
            "try to get around limits, quotas or the one-scan-at-a-time rule, for example with many accounts",
            "overload the service, scrape it, or use it in a way that harms other people's use of it",
            "probe, attack or reverse engineer the service, or try to reach data that is not yours",
            "break the law or the rights of others while using the service",
          ],
        },
        "We may limit, pause or stop access when we need to protect the service or other people.",
      ],
    },
    {
      id: "plans",
      title: "Free use and project passes",
      blocks: [
        `Free use: you can run up to ${f.freeScansPerDay} scans in any 24 hours, one at a time. Free reports show the title and location of every finding, and the full explanation and fix prompt for the most important ones.`,
        `Project pass: a pass covers one repository for ${f.passDays} days. During that time you can scan that repository as often as you like (still one at a time), and every explanation and fix prompt is unlocked. A pass does not renew by itself.`,
        "The price and the currency are shown when you order. Prices include or exclude taxes as shown at checkout. If you pay by bank transfer or QRIS, we confirm your payment by hand, and your pass starts when we confirm it. We may add other payment methods.",
      ],
    },
    {
      id: "refunds",
      title: "Refunds",
      blocks: [
        `You can ask for a refund within ${f.refundDays} days of paying, as long as no scan has used the pass yet. Email ${f.contactEmail} with your payment reference. Once a scan has used the pass, or after ${f.refundDays} days, payments are not refundable, unless the law of your country says otherwise.`,
      ],
    },
    {
      id: "content",
      title: "Your code, our reports and our service",
      blocks: [
        "Your code stays yours. By asking us to scan a repository you allow us to download a temporary copy and process it to produce your report, as described in the Privacy Policy.",
        "The report is for you. You may use it and share it as you like.",
        `The ${f.product} service, its design, its checks and its text belong to us or our licensors. These terms do not give you any right in them except to use the service as described here.`,
        "If you send us feedback, we may use it without owing you anything for it.",
      ],
    },
    {
      id: "availability",
      title: "Availability",
      blocks: ["We try to keep the service running, but we do not promise that it will always be available or free of errors. We may change, pause or stop parts of it. If we end the whole service, we will tell you in advance and refund any pass that still has time left."],
    },
    {
      id: "ending",
      title: "Ending your use",
      blocks: [
        `You can stop using the service at any time and delete your account on your account page, or by emailing ${f.contactEmail}.`,
        "We may suspend or end your access if you break these terms, if the law requires it, or if your use puts the service or other people at risk. Where we reasonably can, we will tell you why.",
        "Sections that by their nature should continue, such as the ones about results, liability and the law that applies, continue after your use ends.",
      ],
    },
    {
      id: "warranty",
      title: "No warranty",
      blocks: ["The service is provided as it is and as available. To the extent the law allows, we give no promise that it will meet your needs, find every problem, or be free of errors."],
    },
    {
      id: "liability",
      title: "Limit of our responsibility",
      blocks: [
        "To the extent the law allows, we are not responsible for indirect or consequential loss, or for loss of profit, data or reputation, arising from your use of the service or from relying on a report.",
        "To the extent the law allows, our total responsibility to you for anything connected with the service is limited to the amount you paid us in the 12 months before the event. If you paid nothing, that limit is zero.",
        "Nothing in these terms limits responsibility that cannot be limited by law, including for fraud or for harm to a person.",
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      blocks: [`We may update these terms. We will change the date and, if the change matters, tell you in the service or by email before it takes effect. If you keep using the service after that, you accept the new terms. This version was last updated on ${f.lastUpdated}.`],
    },
    {
      id: "law",
      title: "Law that applies",
      blocks: [
        `These terms are governed by the law of ${f.governingLaw}. If we have a disagreement, we will first try to settle it by talking. If that fails, the courts with jurisdiction in ${f.governingLaw.replace(/^the /, "")} can decide it. Your rights under the mandatory consumer law of the place where you live are not affected.`,
      ],
    },
    {
      id: "general",
      title: "General",
      blocks: [
        "If part of these terms cannot be enforced, the rest still applies. If we do not enforce a term at once, that does not mean we give it up. You may not transfer your account or these terms to someone else without our consent. These terms and the Privacy Policy are the whole agreement between you and us about the service.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [`${f.operatorName}, ${f.contactEmail}.`],
    },
  ];
}