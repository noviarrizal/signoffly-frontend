import type { LegalFacts, Section } from "@/content/legal-types";

/**
 * The Privacy Policy. It describes what the product really does today (see the backend: internal/store and
 * docs/mvp-spec.md section 10.4). If the product changes, this text must change first.
 */
export function privacySections(f: LegalFacts): Section[] {
  const active = f.processors.filter((p) => p.active);
  return [
    {
      id: "who",
      title: "Who we are",
      blocks: [
        `${f.product} is a service that reads a public GitHub repository and writes a report on security, testing, code quality and privacy risk. It is run by ${f.operatorName} ("we", "us"). We decide why and how the personal data described here is used, which makes us the controller of that data.`,
        `You can reach us at ${f.contactEmail} for anything in this policy.`,
      ],
    },
    {
      id: "data",
      title: "The data we handle",
      blocks: [
        {
          table: {
            head: ["Kind of data", "What it includes", "Where it comes from"],
            rows: [
              ["Account", "Your email address, your name and the identifier of your GitHub account. We only accept an email that GitHub has verified.", "GitHub, when you sign in"],
              ["Scan requests and results", "The repository you asked us to scan (owner, name, branch, commit), the legal regions you chose, the status, score and verdict, and the findings: rule, severity, file paths, line numbers and a short excerpt with secrets masked.", "You, and our analysis of the repository"],
              ["Orders and passes", "The repository, the currency and amount, a payment reference, the status and the dates.", "You, when you order a project pass"],
              ["Technical data", "Our server logs record the method, address path, result code and duration of each request. Our hosting providers may also log your IP address and browser details.", "Your browser"],
              ["Messages", "What you write to us by email, and your email address.", "You"],
            ],
          },
        },
        "We do not use advertising or analytics trackers, and we do not use cookies to follow you around the web.",
        "When you paste a link that we cannot scan, for example a live website, we add one to an anonymous daily count for that type of link, so we know what to build next. The link itself is not stored.",
      ],
    },
    {
      id: "repositories",
      title: "What happens to the code you scan",
      blocks: [
        "To scan a public repository we download a temporary copy, read it as text, and delete the copy when the scan ends. We never run your code.",
        "We keep only the findings and the short excerpts needed to show you where a problem is. Before an excerpt is stored, we shorten it and mask anything that looks like a secret. Our logs do not contain your code or secrets.",
        "We only scan public repositories for now. Public code is already visible to anyone, and we still treat what we read from it with care.",
      ],
    },
    {
      id: "why",
      title: "Why we use your data",
      blocks: [
        {
          table: {
            head: ["What we do", "Why we are allowed to"],
            rows: [
              ["Create your account, run your scans and show you the results", "It is needed to provide the service you asked for"],
              ["Sell and activate project passes, and keep payment records", "It is needed to provide what you bought, and to meet accounting and tax rules"],
              ["Keep the service secure, apply usage limits, prevent abuse and fix problems", "It is in our legitimate interest to run a safe service, and security duties may also require it"],
              ["Answer your messages and requests about your data", "It is in our legitimate interest, and the law may require us to answer"],
              ["Count the kinds of links people try that we cannot scan yet", "It is in our legitimate interest to improve the product, and the counts are anonymous"],
            ],
          },
        },
        "Where the law of your country says we need your consent for something, we will ask for it first.",
      ],
    },
    {
      id: "sharing",
      title: "Who we share data with",
      blocks: [
        "We do not sell your personal data. We share it only with the providers that help us run the service, and where the law requires us to.",
        active.length > 0
          ? {
              table: {
                head: ["Provider", "What it does for us", "Where"],
                rows: active.map((p) => [p.name, p.purpose, p.where]),
              },
            }
          : "We currently use no providers that need to be listed.",
        "We also use providers that host our website and our servers. If you pay by bank transfer or QRIS, your bank handles the payment and we only see the details you send us.",
        "Artificial intelligence: we do not currently send your code or your data to an AI model provider. Our reports are written from templates. If that changes, we will name the provider, say what is sent and where it is processed, and update this policy before we start.",
        "We may disclose data to the authorities when the law requires it.",
      ],
    },
    {
      id: "transfers",
      title: "Where your data is processed",
      blocks: [
        "Our database is in Singapore. Our servers and providers may be in other countries, so your data may cross borders, including when you use Signoffly from outside the country where it is processed. Where the law requires safeguards for such transfers, we use them.",
      ],
    },
    {
      id: "retention",
      title: "How long we keep it",
      blocks: [
        {
          list: [
            "Your account, scans, reports, orders and passes: until you delete your account. You can do that yourself on your account page, and everything tied to the account is deleted with it.",
            "Records of payments that are kept outside the app, such as bank records and our own accounting: as long as accounting and tax rules require.",
            "Messages you send us: as long as we need them to deal with your request.",
            "Backups: copies disappear when the backups expire.",
          ],
        },
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      blocks: [
        "Depending on where you live, you can ask us to:",
        { list: ["tell you what data we hold about you and give you a copy", "correct data that is wrong", "delete your data", "limit or stop how we use it", "send it to you in a form you can reuse", "stop relying on your consent, if that is what we rely on"] },
        `To use any of these rights, email ${f.contactEmail} from the address on your account. We may ask you to prove who you are. We answer as quickly as we can, and within the time the law requires.`,
        "Downloading your data and deleting your account: you can do both yourself on your account page. You can also email us.",
        "You can also complain to the data protection authority in the place where you live.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies and similar storage",
      blocks: [
        "We use only what the site needs to work:",
        { list: ["a session cookie that keeps you signed in", "a security cookie that protects the sign-in form against forged requests", "a short-lived cookie that remembers where to send you after you sign in", "your choice of light or dark theme, saved in your browser"] },
        "None of these is used for advertising or tracking.",
      ],
    },
    {
      id: "security",
      title: "How we protect your data",
      blocks: [
        "We use encrypted connections, we limit who and what can reach our systems, we mask secrets before we store anything, and we keep a copy of your repository only while the scan runs. No system is perfectly secure. If a breach affects your data, we will tell you and the authorities as the law requires.",
      ],
    },
    {
      id: "children",
      title: "Children",
      blocks: [`${f.product} is not meant for children, and you must be at least 18 to use it. We do not knowingly collect children's data. If you think a child has given us data, contact us and we will delete it.`],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: [`We will update this policy when the product or the law changes, and we will change the date at the top. If a change matters to you, we will tell you in the service or by email before it takes effect. This version was last updated on ${f.lastUpdated}.`],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [`${f.operatorName}, ${f.contactEmail}.`],
    },
  ];
}