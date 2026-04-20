export type LandingSegment = {
  slug: string;
  keyword: string;
  title: string;
  metaDescription: string;
  h1: string;
  subheadline: string;
  problemStatement: string;
  midCTACopy: string;
  features: { headline: string; description: string }[];
  socialProofQuotes: { text: string; name: string }[];
  faq: { question: string; answer: string }[];
  howItWorksSteps: [
    { title: string; sub: string },
    { title: string; sub: string },
    { title: string; sub: string },
  ];
  bottomCTACopy: string;
  utmCampaign: string;
  isComparison?: boolean;
  comparisonTarget?: string;
  comparisonRows?: { feature: string; studymo: string; competitor: string }[];
  badge: string;
  learningStyleSection: { label: string; heading: string; body: string };
  screenshotAlt: string;
};

export const segments: Record<string, LandingSegment> = {
  'ai-tutor': {
    slug: 'ai-tutor',
    keyword: 'ai tutor',
    title: 'AI Tutor for Students | Studymo',
    metaDescription:
      'What is an AI tutor? Studymo is an AI tutor that learns your course material and answers from it. Get flashcards, quizzes, and 24/7 tutoring from your own notes.',
    h1: 'An AI Tutor That Knows Your Exact Material',
    subheadline:
      'Upload your notes and get a tutor that explains your content, not just generic answers.',
    problemStatement:
      "Finding a tutor is expensive. Office hours are once a week and usually packed. ChatGPT gives you answers, but it doesn't know what's on your exam. You need something that works with what you're actually studying, not a generic substitute.",
    midCTACopy:
      "Not sure if it'll actually help? Try it on one subject. Upload a lecture, ask a few questions, and see how it explains your material. It takes about three minutes.",
    features: [
      {
        headline: 'Knows your content',
        description:
          'Upload a PDF, lecture slide, or YouTube URL. The tutor answers from that material, not the internet.',
      },
      {
        headline: 'Explains at your level',
        description:
          'Ask it to explain again, simpler. It adjusts. No judgment for asking the same question twice.',
      },
      {
        headline: 'Available at 3am',
        description:
          'No scheduling, no waiting, no cancellations. It works when you do, including the night before an exam.',
      },
      {
        headline: 'Tracks what you keep missing',
        description:
          'Every wrong answer teaches the tutor where you struggle. Future sessions focus there automatically.',
      },
      {
        headline: 'Covers every format',
        description:
          'Lecture slides, YouTube videos, audio recordings, website URLs. Upload once, study everything.',
      },
    ],
    socialProofQuotes: [
      {
        text: "I failed my first two bio exams. After using this to prep for the third, I got an 88. It just explains things differently than my professor does.",
        name: 'Marcus T., sophomore',
      },
      {
        text: "Office hours are at 8am on Fridays. I study at midnight. This thing is available whenever I am.",
        name: 'Priya S., junior',
      },
      {
        text: "I upload my lecture slides before class and already have notes by the time I sit down. It saves me at least two hours a week.",
        name: 'Jordan K., first year',
      },
      {
        text: "Asked it the same question four different ways because I kept not getting it. It just kept trying. A real tutor would've given up.",
        name: 'Aisha M., undergrad',
      },
    ],
    faq: [
      {
        question: 'Does the AI tutor use my uploaded content or general knowledge?',
        answer:
          'It uses your content. When you upload a PDF, lecture, or URL, the tutor answers from that material. It can also draw on general knowledge for context, but it stays focused on what you uploaded.',
      },
      {
        question: 'What file types can I upload?',
        answer:
          'PDFs, audio recordings, YouTube URLs, website URLs, and you can create blank notes directly in the app. Most things your professor gives you will work.',
      },
      {
        question: "How is this different from just asking ChatGPT?",
        answer:
          "ChatGPT doesn't know your syllabus, your professor's slide deck, or what's on your specific exam. Studymo does, because you uploaded it. It also generates flashcards, quizzes, and practice exams from your material, which ChatGPT doesn't do.",
      },
      {
        question: 'Is it available on mobile?',
        answer:
          'Yes. The web app works on any device. A native app is in development.',
      },
      {
        question: 'How much does it cost?',
        answer:
          "There's a free tier you can use without a credit card. Paid plans unlock higher upload limits and additional features. Check the pricing page for current rates.",
      },
    ],
    badge: '24/7 AI tutoring from your own notes',
    screenshotAlt: 'Studymo AI tutor for students answering questions from uploaded course notes',
    learningStyleSection: {
      label: 'Built around your material',
      heading: 'An AI Tutor That Actually Knows Your Course',
      body: 'Upload once. Every answer, flashcard, and quiz comes from your specific content — not generic AI responses.',
    },
    howItWorksSteps: [
      { title: 'Upload Your Material', sub: 'PDFs, YouTube links, audio, slides, or any URL.' },
      { title: 'Get Notes and Study Tools', sub: 'Flashcards, quizzes, and a transcript generated automatically.' },
      { title: 'Ask the AI Tutor', sub: 'Get answers from your content, any time you need them.' },
    ],
    bottomCTACopy:
      "You've been struggling through this course alone. You don't have to. Try it free tonight.",
    utmCampaign: 'ai-tutor',
  },

  adhd: {
    slug: 'adhd',
    keyword: 'how to study with adhd',
    title: 'Study App for ADHD Students | Studymo',
    metaDescription:
      'How to study with ADHD without fighting your brain. Studymo uses audio learning, short quizzes, and a weak topic tracker built for how ADHD students actually focus.',
    h1: 'A Study App Built Around How Your Brain Works',
    subheadline:
      "No walls of text. No rigid schedules. Just tools that match the way you actually focus.",
    problemStatement:
      "Standard study apps assume you can sit for two hours and absorb a textbook. You can't. Not consistently. That's not a failure; it's just how your brain is wired. What you need are shorter sessions, varied formats, and something that keeps you moving instead of staring at a page.",
    midCTACopy:
      "If you've tried ten different study methods and none of them stuck, that's worth exploring. Studymo works differently because it doesn't force you into one format. Try it free.",
    features: [
      {
        headline: 'Short bursts, not marathons',
        description:
          'Flashcards, quizzes, and podcasts let you switch formats before you burn out. No two-hour reading sessions required.',
      },
      {
        headline: 'Audio instead of reading',
        description:
          'Turn your notes into a podcast. Study on a walk, in the car, doing dishes. Your ears work even when your eyes check out.',
      },
      {
        headline: 'AI tutor for questions, not lectures',
        description:
          'Ask a question, get a focused answer. No paragraph-long explanations unless you ask for them.',
      },
      {
        headline: 'See exactly what to study',
        description:
          "Your weak topics are listed in one place. No decision fatigue about where to start. You open the app and it tells you.",
      },
      {
        headline: 'Plans that do the thinking',
        description:
          "Set a test date. Studymo builds a day-by-day study plan. You just follow it instead of figuring out what to do each time.",
      },
    ],
    socialProofQuotes: [
      {
        text: "I have ADHD and I've never been able to use flashcard apps because making the cards takes forever. Studymo generates them automatically. That's the part that actually matters.",
        name: 'Derek L., senior',
      },
      {
        text: "The podcast mode changed everything for me. I retain so much more from listening than reading.",
        name: 'Chloe R., junior',
      },
      {
        text: "Having a list that tells me exactly what topics I'm weak on eliminates the part where I spiral for 20 minutes trying to decide what to study.",
        name: 'Sam W., sophomore',
      },
      {
        text: "I stopped using it for a week and bombed a quiz. Started again and passed the next one. It keeps me on track.",
        name: 'Nina B., first year',
      },
    ],
    faq: [
      {
        question: 'How does Studymo help students with ADHD specifically?',
        answer:
          'It reduces friction at every step. You upload content once and get flashcards, quizzes, and a podcast automatically. The weak topic tracker tells you what to focus on so you spend less time deciding and more time studying.',
      },
      {
        question: "Can I listen to my notes instead of reading them?",
        answer:
          'Yes. Podcast mode converts your notes into spoken audio. You can pick the length and listen anywhere. It works well for commutes, workouts, or any time reading feels too hard.',
      },
      {
        question: 'Does the AI tutor stay focused on one topic?',
        answer:
          "It follows the conversation. If you ask about one concept, it answers that. You can redirect it at any time. It doesn't ramble unless you ask follow-up questions.",
      },
      {
        question: 'Is there a way to study in short sessions?',
        answer:
          "Flashcard mode lets you do as many or as few cards as you want. There's no minimum. You can do five cards and close the app. Progress saves automatically.",
      },
      {
        question: 'Will my accommodations affect how I use this?',
        answer:
          "The app works alongside whatever accommodations you have. It's a study tool, not a testing platform, so there's no timer pressure unless you're using the optional timed practice exam mode.",
      },
    ],
    badge: 'Built for how ADHD brains actually study',
    screenshotAlt: 'Studymo study app for ADHD students showing AI tutor chat and flashcard tools',
    learningStyleSection: {
      label: 'Built around how you focus',
      heading: 'Study Tools That Work With Your Brain, Not Against It',
      body: 'Switch formats before you burn out. Audio, flashcards, short quizzes — multiple ways in so something always sticks.',
    },
    howItWorksSteps: [
      { title: 'Upload Your Lectures', sub: 'PDFs, slides, audio, video, or any URL.' },
      { title: 'Get Notes, Flashcards, and a Podcast', sub: 'Multiple formats so you can switch when focus drops.' },
      { title: 'Study Your Way', sub: 'AI tutor, quizzes, or audio — whatever works right now.' },
    ],
    bottomCTACopy:
      "Your brain works differently. Your study tool should too. Try it free.",
    utmCampaign: 'adhd',
  },

  nursing: {
    slug: 'nursing',
    keyword: 'nursing school notes',
    title: 'Nursing School Notes | AI Study Tools | Studymo',
    metaDescription:
      'Turn your nursing school notes into flashcards, quizzes, and NCLEX practice questions automatically. Free nursing school notes tools built for nursing students.',
    h1: 'Nursing School Notes That Study Back',
    subheadline:
      'Upload your lecture slides and get organized nursing school notes, flashcards, and NCLEX-style quizzes in minutes.',
    problemStatement:
      'Nursing school covers everything at once. Pharmacology, pathophysiology, care plans, clinical skills. Reading every textbook chapter is not realistic. You need to process information faster and retain it longer, especially when what you learn will eventually affect real patients.',
    midCTACopy:
      "If you're spending more time making study materials than using them, something's off. Upload one lecture and let Studymo handle the rest.",
    features: [
      {
        headline: 'Understand, not just memorize',
        description:
          'The AI tutor explains why a drug works and how it interacts, not just what it does. Clinical reasoning takes understanding.',
      },
      {
        headline: 'Study from your actual lectures',
        description:
          'Upload your professor slides. Get organized notes and flashcards from your specific course content.',
      },
      {
        headline: 'Practice NCLEX-style thinking',
        description:
          "Quizzes and practice exams train you to choose the best answer when two choices both seem right. That's what boards test.",
      },
      {
        headline: 'Podcast mode for clinical hours',
        description:
          "Listen to your notes during a commute, between shifts, or while charting. Time you can't sit down becomes study time.",
      },
      {
        headline: 'Tracks what trips you up',
        description:
          "Missed acid-base balance twice? Studymo flags it and brings it back until you've got it.",
      },
    ],
    socialProofQuotes: [
      {
        text: "I was drowning in pharm content. I uploaded my lecture slides and had a full set of flashcards in ten minutes. Passed the unit exam with an 84.",
        name: 'Brittany A., nursing student',
      },
      {
        text: "The AI tutor explained diuretics in a way my professor never did. I actually get the mechanism now instead of just memorizing the name.",
        name: 'Luis C., second year',
      },
      {
        text: "I study on the train between clinical and class. The podcast mode means I'm reviewing content I actually need instead of scrolling my phone.",
        name: 'Tamika J., BSN program',
      },
      {
        text: "My weak topics list is embarrassing but also the most useful thing I have. I know exactly what I need to fix before boards.",
        name: 'Rachel P., senior',
      },
    ],
    faq: [
      {
        question: 'Does Studymo work with nursing school content?',
        answer:
          'Yes. You can upload PDFs, PowerPoints, lecture recordings, and YouTube videos. Most nursing school content fits those formats. The AI generates notes, flashcards, and quizzes from whatever you upload.',
      },
      {
        question: "Can it help me prep for NCLEX?",
        answer:
          'It helps with content review and clinical reasoning practice. Practice exams can be generated from your uploaded study material in a multiple-choice format similar to NCLEX. It works best alongside a dedicated NCLEX review program.',
      },
      {
        question: 'Does the AI tutor understand clinical concepts?',
        answer:
          "Yes. You can ask it to explain pharmacokinetics, electrolyte imbalances, cardiac rhythms, or any other clinical concept. It draws from your uploaded material and its general clinical knowledge.",
      },
      {
        question: 'How long does it take to process a lecture upload?',
        answer:
          'Most uploads process in two to five minutes. Longer audio files or large PDFs may take a bit more. You can use the app while it processes.',
      },
      {
        question: 'Can I use this with Hurst, ATI, or other review programs?',
        answer:
          "Yes. You can upload PDFs or notes from any review program. Studymo generates study tools from whatever you bring in. It works alongside any review course you're already using.",
      },
    ],
    badge: 'From lecture slides to nursing school notes in minutes',
    screenshotAlt: 'Studymo nursing school notes tool showing AI-generated clinical notes and NCLEX practice questions',
    learningStyleSection: {
      label: 'Built for nursing students',
      heading: 'Nursing School Notes That Do More Than Sit in a Folder',
      body: 'Upload your lectures and get organized nursing school notes, flashcards, and quizzes — everything you need to go from content to exam-ready.',
    },
    howItWorksSteps: [
      { title: 'Upload Your Lecture Slides', sub: 'PDFs, recordings, YouTube links, or any URL.' },
      { title: 'Get Notes and Flashcards', sub: 'Clinical content organized and ready to review.' },
      { title: 'Study with the AI Tutor', sub: 'Ask clinical questions and practice for NCLEX-style thinking.' },
    ],
    bottomCTACopy:
      "You didn't choose nursing because it was easy. Don't let the studying be the thing that stops you. Try it free tonight.",
    utmCampaign: 'nursing',
  },

  'nclex-tutor': {
    slug: 'nclex-tutor',
    keyword: 'nclex tutor',
    title: 'NCLEX Tutor | AI-Powered Boards Prep | Studymo',
    metaDescription:
      'An NCLEX tutor available 24/7. Trains clinical reasoning, not just memorization. Practice exams, weak topic tracking, and explanations from your review materials.',
    h1: 'Pass Your NCLEX on the First Try',
    subheadline:
      "An AI tutor that trains your clinical reasoning, not just your ability to recall facts.",
    problemStatement:
      "The NCLEX doesn't test memorization. It tests your ability to think like a nurse under pressure. Multiple-choice questions where two choices both seem right. Most study tools teach you facts. NCLEX tests judgment. That gap is exactly why people fail after years of preparation.",
    midCTACopy:
      "If you're taking practice questions and still unsure why the right answer is right, that's the gap to fix. Studymo explains the reasoning, not just the answer.",
    features: [
      {
        headline: 'NCLEX-style question practice',
        description:
          'Generate practice exams from your uploaded study material in a multiple-choice format that trains the same thinking the real exam requires.',
      },
      {
        headline: 'Explains the reasoning, not just the answer',
        description:
          "After a wrong answer, the AI walks through why the correct choice was correct. That's how you stop making the same mistake.",
      },
      {
        headline: 'Works with your review materials',
        description:
          'Upload your Hurst notes, ATI content, or any study material as a PDF. Studymo generates flashcards and a tutor from it.',
      },
      {
        headline: 'Tracks your weak clinical concepts',
        description:
          "Fluid and electrolytes, cardiac, respiratory, pharmacology. You'll see exactly which areas need more time before you sit for boards.",
      },
      {
        headline: 'Available when the anxiety hits',
        description:
          'No appointments, no waiting, no scheduling. It works the night before, early in the morning, whenever you need it.',
      },
    ],
    socialProofQuotes: [
      {
        text: "I failed NCLEX-RN the first time. I used Studymo for six weeks before my second attempt and passed. The weak topic tracker showed me exactly what I was missing.",
        name: 'Monique T., RN',
      },
      {
        text: "The tutor explains prioritization questions in a way that actually makes sense. I stopped guessing on those.",
        name: 'Carlos R., nursing graduate',
      },
      {
        text: "I uploaded my ATI notes and had 200 flashcards in the time it would've taken me to make 20 by hand.",
        name: 'Sarah K., nursing student',
      },
      {
        text: "Knowing which topics I was weakest on let me use my final two weeks way more efficiently than I would have otherwise.",
        name: 'James L., BSN candidate',
      },
    ],
    faq: [
      {
        question: 'Can Studymo replace a dedicated NCLEX review program?',
        answer:
          "It works best alongside a review program, not instead of one. It helps you process and retain the content from any review program you bring in. Many students use it with Hurst, ATI, or UWorld.",
      },
      {
        question: 'Does the practice exam format match NCLEX?',
        answer:
          "The questions are multiple-choice and focus on clinical reasoning, similar to NCLEX. They're generated from your uploaded study material, so the content is specific to what you're reviewing.",
      },
      {
        question: "What if I don't know why I keep missing certain questions?",
        answer:
          "That's exactly what the weak topic tracker is for. It identifies the specific concepts behind your wrong answers, not just the topic category. You'll see patterns you wouldn't catch on your own.",
      },
      {
        question: 'Can I use it if I have limited study time?',
        answer:
          "Yes. You can do ten flashcards in three minutes. The podcast mode lets you review while doing other things. The study plan feature breaks your prep into daily sessions based on your available time.",
      },
      {
        question: 'How much does it cost?',
        answer:
          "There's a free tier with no credit card required. Paid plans are available monthly or annually and cost significantly less than other NCLEX prep tools.",
      },
    ],
    badge: 'NCLEX prep that trains clinical reasoning',
    screenshotAlt: 'Studymo NCLEX tutor showing AI-generated practice questions and weak topic tracking',
    learningStyleSection: {
      label: 'Built to pass boards',
      heading: 'NCLEX Prep That Trains Reasoning, Not Just Recall',
      body: 'Every tool is built around the judgment NCLEX actually tests. Practice questions, weak topic tracking, and a tutor that explains the why behind every answer.',
    },
    howItWorksSteps: [
      { title: 'Upload Your Review Materials', sub: 'Hurst, ATI, or any PDF or recorded lecture.' },
      { title: 'Get Flashcards and Practice Exams', sub: 'NCLEX-style questions generated from your content.' },
      { title: 'Train With the AI Tutor', sub: 'Ask why answers are right or wrong. Build clinical reasoning.' },
    ],
    bottomCTACopy:
      "You didn't come this far to fail your boards. Try it free tonight.",
    utmCampaign: 'nclex-tutor',
  },

  chemistry: {
    slug: 'chemistry',
    keyword: 'chemistry notes',
    title: 'Chemistry Notes | AI Study Tools | Studymo',
    metaDescription:
      'Turn your chemistry notes into flashcards and quizzes automatically. Covers gen chem, organic chemistry notes, AP chemistry notes, and more.',
    h1: 'Chemistry Notes That Actually Help You Learn',
    subheadline:
      'Upload your lecture slides and get organized chemistry notes, flashcards, and an AI tutor that explains reactions step by step.',
    problemStatement:
      "Chemistry moves fast. Mechanisms stack on mechanisms. If you miss one concept, the next three stop making sense. Your textbook explains things in a way that's technically correct but practically useless for an exam. You need something that breaks it down the way you actually think.",
    midCTACopy:
      "If you've read the chapter twice and still don't get it, more reading isn't the answer. Try asking the AI tutor to explain it in plain terms.",
    features: [
      {
        headline: 'Notes from your actual lectures',
        description:
          "Upload your professor's slides and get clean, organized notes you can actually study from.",
      },
      {
        headline: 'Flashcards on the concepts that matter',
        description:
          'Mechanisms, formulas, reaction types. Auto-generated from your course content, not a generic chem deck.',
      },
      {
        headline: 'AI tutor explains step by step',
        description:
          'Ask it to walk through a mechanism. It does, in plain language, as many times as you need.',
      },
      {
        headline: 'Practice exams before every test',
        description:
          "Generate a practice exam from your uploaded material. Know your gaps before the real thing, not during it.",
      },
      {
        headline: 'YouTube lecture to notes in minutes',
        description:
          "Paste a lecture URL and get organized notes without watching the whole thing. Useful for recorded lectures you don't have time to sit through.",
      },
    ],
    socialProofQuotes: [
      {
        text: "Ochem was destroying me. I uploaded my lecture slides and asked the AI to explain SN2 reactions from scratch. I finally got it on the third explanation.",
        name: 'Taylor M., sophomore',
      },
      {
        text: "I paste my professor's YouTube recordings into Studymo and have notes before he even posts the slide deck.",
        name: 'Kevin H., junior',
      },
      {
        text: "The practice exams it generates from my notes are harder than the actual exams. That's exactly what I needed.",
        name: 'Ananya R., pre-med',
      },
      {
        text: "I was failing general chemistry. I used this for two weeks and passed the midterm. I can actually explain why reactions happen now.",
        name: 'Darius F., first year',
      },
    ],
    faq: [
      {
        question: 'Does this work for organic chemistry?',
        answer:
          "Yes. You can upload your orgo lecture slides and ask the AI to explain reaction mechanisms, stereochemistry, or any other concept. It works for gen chem, orgo, biochemistry, and other chemistry courses.",
      },
      {
        question: 'Can I upload chemistry textbook pages?',
        answer:
          "Yes, as a PDF. The AI generates notes and flashcards from the content. It handles equations and reactions reasonably well, though complex diagrams may not render perfectly.",
      },
      {
        question: 'How does the AI tutor handle equations?',
        answer:
          "It explains equations in text. It can walk through balancing reactions, stoichiometry problems, and reaction mechanisms step by step. It's best for conceptual explanation rather than real-time problem solving.",
      },
      {
        question: 'What if my professor posts lecture videos?',
        answer:
          'If they post on YouTube, you can paste the URL directly into Studymo. For other video platforms, you can download the audio and upload it as a file.',
      },
      {
        question: 'Is there a limit on how many things I can upload?',
        answer:
          "The free tier has a limit on uploads. Paid plans increase that limit significantly. You won't hit the ceiling in a normal week of studying.",
      },
    ],
    badge: 'Gen chem, orgo, and AP chemistry notes in one place',
    screenshotAlt: 'Studymo chemistry notes tool showing AI-generated notes and reaction mechanism flashcards',
    learningStyleSection: {
      label: 'Built around your chemistry course',
      heading: 'Chemistry Notes for Every Course Level',
      body: 'Gen chem, organic chemistry, AP chemistry — upload your lecture slides and get notes, flashcards, and quizzes built from your actual material.',
    },
    howItWorksSteps: [
      { title: 'Upload Your Lecture or Slides', sub: 'PDF, YouTube URL, audio recording, or slide deck.' },
      { title: 'Get Notes and Flashcards', sub: 'Mechanisms, formulas, and reactions organized automatically.' },
      { title: 'Ask the AI to Explain It', sub: 'Step-by-step breakdowns of any concept, as many times as you need.' },
    ],
    bottomCTACopy:
      "Chemistry doesn't have to be the class that breaks your GPA. Try it free.",
    utmCampaign: 'chemistry',
  },

  'chemistry-tutor': {
    slug: 'chemistry-tutor',
    keyword: 'chemistry tutor',
    title: 'AI Chemistry Tutor Available 24/7 | Studymo',
    metaDescription:
      'Get step-by-step chemistry explanations without waiting for office hours. Upload your course material and get an AI tutor that knows your syllabus.',
    h1: 'A Chemistry Tutor Available Any Time You Need One',
    subheadline:
      'Get step-by-step explanations without waiting for office hours or paying $80 an hour.',
    problemStatement:
      "Office hours are once a week and usually packed. Private tutors cost $60 to $100 an hour. You don't need someone to solve the problem for you. You need someone to explain the concept you're missing so you can solve the next ten yourself. That's what Studymo does.",
    midCTACopy:
      "One month of Studymo costs less than a single session with a private tutor. And it's available every night of the week.",
    features: [
      {
        headline: 'Explains mechanisms, not just answers',
        description:
          'Ask why a nucleophile attacks there, not just which product forms. Understanding the why fixes the pattern.',
      },
      {
        headline: 'Works from your course material',
        description:
          "Upload your syllabus, notes, or a textbook chapter. The tutor stays on what you're actually studying.",
      },
      {
        headline: 'Available before every exam',
        description:
          'No cancellations, no scheduling, no waiting. It works at 11pm the night before your midterm.',
      },
      {
        headline: 'Cheaper than one tutoring session',
        description:
          "A full month of Studymo costs less than a single hour with a private tutor. And it doesn't cancel.",
      },
      {
        headline: 'Generates practice problems',
        description:
          "Ask it to quiz you on a topic and work through problems with explanations for each step.",
      },
    ],
    socialProofQuotes: [
      {
        text: "I was spending $80 a week on a chemistry tutor. Switched to Studymo and my grade stayed the same. The tutor was mostly just explaining concepts I can now ask the AI directly.",
        name: 'Emma S., pre-med sophomore',
      },
      {
        text: "Office hours are at 8am on Fridays. I study at midnight. This is the only tutoring option that actually fits my schedule.",
        name: 'Raj K., junior',
      },
      {
        text: "I asked it to explain limiting reagents three different ways before I understood. It never got impatient.",
        name: 'Olivia T., first year',
      },
      {
        text: "My professor doesn't explain mechanisms well. The AI does. I've stopped going to lecture and just upload the slides.",
        name: 'Ben W., sophomore',
      },
    ],
    faq: [
      {
        question: 'Can the AI tutor solve chemistry problems for me?',
        answer:
          "It can walk through how to solve a type of problem step by step, which is more useful than just giving you an answer. For specific numerical problems, it explains the approach rather than calculating for you.",
      },
      {
        question: 'Does it work for physical chemistry and biochemistry?',
        answer:
          "Yes. It covers general chemistry, organic chemistry, physical chemistry, and biochemistry. Upload the relevant course material and it draws from that content.",
      },
      {
        question: 'How do I know the explanations are accurate?',
        answer:
          "For chemistry specifically, the core concepts are well-established and the AI handles them reliably. For anything advanced or edge-case, verify with your textbook or professor. Treat it like a study buddy, not a textbook.",
      },
      {
        question: 'Can I ask follow-up questions?',
        answer:
          "Yes. The tutor holds context in a conversation. You can ask a follow-up, request a simpler explanation, or ask it to give an example. The conversation continues as long as you need it.",
      },
      {
        question: "What if I'm confused about something mid-conversation?",
        answer:
          "Just say so. Type 'I don't understand' or 'explain that differently' and it will try another approach. There's no penalty for not getting it the first time.",
      },
    ],
    badge: 'No scheduling. No waiting. No office hours.',
    screenshotAlt: 'Studymo AI chemistry tutor explaining reaction mechanisms step by step from uploaded lecture slides',
    learningStyleSection: {
      label: 'Available when you need it',
      heading: 'A Chemistry Tutor With No Office Hours',
      body: 'No scheduling, no cancellations. Ask about any reaction, mechanism, or concept from your course material and get a clear explanation.',
    },
    howItWorksSteps: [
      { title: 'Upload Your Course Material', sub: 'Lecture slides, textbook chapters, or a YouTube URL.' },
      { title: 'Get Notes and Practice Problems', sub: 'Flashcards and quizzes built from your chemistry content.' },
      { title: 'Ask the Tutor Anything', sub: 'Mechanisms, reactions, or concepts explained step by step.' },
    ],
    bottomCTACopy:
      "Stop paying $80 an hour for explanations you can get right now, for free. Try it tonight.",
    utmCampaign: 'chemistry-tutor',
  },

  'biology-tutor': {
    slug: 'biology-tutor',
    keyword: 'biology tutor',
    title: 'AI Biology Tutor That Knows Your Course | Studymo',
    metaDescription:
      'A biology tutor that learns from your uploaded lectures. Get explanations from your actual course content, not generic answers.',
    h1: 'A Biology Tutor That Knows Your Exact Course',
    subheadline:
      'Upload your lectures and get a tutor that explains concepts from your actual material.',
    problemStatement:
      "Biology covers a lot of ground. Cell biology, genetics, ecology, physiology. It's not just memorization; you need to understand how systems connect. A generic tutor doesn't know your professor's focus areas or what's on your specific exam. Studymo does, because it learns from what you upload.",
    midCTACopy:
      "Try it on one topic you've been struggling with. Upload a lecture, ask a question, and see if the explanation clicks better.",
    features: [
      {
        headline: 'Tutor from your own notes',
        description:
          "Upload lecture slides and the AI tutor answers from your course content, including your professor's specific examples.",
      },
      {
        headline: 'Connects concepts, not just definitions',
        description:
          'Ask how the Krebs cycle connects to glycolysis. Get an explanation of the relationship, not two separate definitions.',
      },
      {
        headline: 'Flashcards for every key term',
        description:
          "Generated from your material. Not a generic biology deck someone else made for a different course.",
      },
      {
        headline: 'Available the night before an exam',
        description:
          'No scheduling, no waiting. Study until you understand it, even at 2am.',
      },
      {
        headline: 'Tracks what you keep getting wrong',
        description:
          "Confused mitosis and meiosis again? Studymo notes it and brings it back in future quizzes until it sticks.",
      },
    ],
    socialProofQuotes: [
      {
        text: "My professor tests on very specific details from lecture that aren't in the textbook. Uploading the slides means the AI knows exactly what to focus on.",
        name: 'Hannah L., biology major',
      },
      {
        text: "I asked it to explain how DNA replication errors lead to mutations. It walked me through the whole pathway. I finally understood the connection.",
        name: 'David C., sophomore',
      },
      {
        text: "The flashcards it generates are better than anything I would've made myself. It picks the right things to test.",
        name: 'Fatima O., junior',
      },
      {
        text: "I went from failing practice exams to passing the real one. The weak topic tracker kept me honest about what I actually knew.",
        name: 'Noah P., pre-med',
      },
    ],
    faq: [
      {
        question: 'Does this work for AP Biology and college biology?',
        answer:
          "Yes. It works for any level. Upload your textbook chapters, lecture slides, or study guides and the AI generates study tools from that content.",
      },
      {
        question: 'Can it explain diagrams and charts from my lecture slides?',
        answer:
          "It processes text and standard diagrams from PDFs and slides. For complex figures like detailed anatomical diagrams, it works better when you ask specific conceptual questions about them.",
      },
      {
        question: 'How is this different from Khan Academy for biology?',
        answer:
          "Khan Academy teaches general biology concepts. Studymo teaches your specific course material. If your professor emphasizes certain topics or uses specific examples, Studymo knows those because you uploaded the lectures.",
      },
      {
        question: 'Can I use this for genetics specifically?',
        answer:
          "Yes. Genetics is one of the areas where the AI tutor works well because the logic of inheritance follows clear rules that it can explain in multiple ways.",
      },
      {
        question: 'Will it help me memorize scientific names and terminology?',
        answer:
          "Yes. The flashcard system is built for exactly that. It generates term-definition pairs from your material and tracks which ones you keep missing.",
      },
    ],
    badge: 'Learns from your professor\'s slides',
    screenshotAlt: 'Studymo AI biology tutor answering questions from uploaded lecture slides and course notes',
    learningStyleSection: {
      label: 'Built from your lectures',
      heading: 'A Biology Tutor That Knows Your Course, Not Just Biology',
      body: 'Upload your professor\'s slides and the tutor answers from that content. Your examples, your exam topics, your terminology.',
    },
    howItWorksSteps: [
      { title: 'Upload Your Biology Lectures', sub: 'Slides, PDFs, audio, video, or any URL.' },
      { title: 'Get Notes and Flashcards', sub: 'Key terms, concepts, and processes organized from your content.' },
      { title: 'Ask the Tutor to Connect the Dots', sub: 'Get explanations of how systems relate, not just definitions.' },
    ],
    bottomCTACopy:
      "Biology is hard. Understanding it doesn't have to be. Try it free.",
    utmCampaign: 'biology-tutor',
  },

  finals: {
    slug: 'finals',
    keyword: 'how to study for finals',
    title: 'How to Study for Finals | Studymo',
    metaDescription:
      'Stop cramming and start targeting what you don\'t know. Studymo builds your finals study plan, generates practice exams, and tracks your weak topics automatically.',
    h1: 'Study for Finals the Way That Actually Works',
    subheadline:
      'Upload everything you need to know and get a study plan, flashcards, and an AI tutor in minutes.',
    problemStatement:
      "Finals week is too much, too fast. Five exams, two weeks, a full semester of content. You don't have time to re-read everything. You need to figure out what matters, understand what you don't know, and practice until it sticks. Studymo handles the first two so you can focus on the third.",
    midCTACopy:
      "You can keep highlighting notes you've already read three times. Or you can actually test yourself on the material. Studymo makes the second option faster.",
    features: [
      {
        headline: 'Semester notes to flashcards in minutes',
        description:
          "Upload everything from the semester and get organized flashcards by topic. No manual card creation.",
      },
      {
        headline: 'Practice exams before each test',
        description:
          "Know your gaps before the exam, not during it. Generate a practice test from your notes and see what's missing.",
      },
      {
        headline: 'AI tutor for the concepts that are not clicking',
        description:
          "Three days before your test is not the time to wait for office hours. Ask the AI and get an answer now.",
      },
      {
        headline: 'Podcast mode while you move',
        description:
          "Walking between buildings, eating, driving to the library. Your notes become audio you can listen to anywhere.",
      },
      {
        headline: 'Weak topic tracker for final review',
        description:
          "Every missed practice question shows up here. Study the list the night before instead of trying to remember what you don't know.",
      },
    ],
    socialProofQuotes: [
      {
        text: "I had four finals in five days. I uploaded all my notes the weekend before and had a full set of flashcards for each class in about an hour total.",
        name: 'Michaela S., junior',
      },
      {
        text: "The practice exam it generated was harder than the actual final. I was ready for anything.",
        name: 'Trevor B., sophomore',
      },
      {
        text: "I realized three days before finals that I'd forgotten basically everything from the first half of the semester. The study plan feature got me through it.",
        name: 'Yuna K., senior',
      },
      {
        text: "I used the AI tutor to review at midnight the night before two back-to-back exams. Passed both. That used to be impossible.",
        name: 'Alex R., first year',
      },
    ],
    faq: [
      {
        question: 'How quickly can I get study materials from my notes?',
        answer:
          "Most uploads process in two to five minutes. You can have flashcards and a quiz for an entire course within an hour of uploading your notes.",
      },
      {
        question: "What if I haven't kept good notes all semester?",
        answer:
          "You can upload anything: your textbook, recorded lectures, slide decks, a classmate's notes, or YouTube review videos. It generates study tools from whatever you bring in.",
      },
      {
        question: 'Can I use this for multiple subjects at once?',
        answer:
          "Yes. You can upload materials for multiple courses and study them in separate folders. The weak topic tracker is organized by document so you can focus on one subject at a time.",
      },
      {
        question: 'Does the AI know what to prioritize for finals?',
        answer:
          "It generates study tools from all the content you upload. If you know which topics are on the exam, upload those specific lectures or chapters. The more targeted the input, the more useful the output.",
      },
      {
        question: 'Is this useful if I only have two days before finals?',
        answer:
          "Yes. Two days is enough time to generate flashcards, run a practice exam, and identify your top five weak areas. That's more actionable than re-reading notes for two days straight.",
      },
    ],
    badge: 'Stop cramming. Start studying smarter.',
    screenshotAlt: 'Studymo finals study app showing flashcards, practice exam, and weak topic list for finals week',
    learningStyleSection: {
      label: 'Built for finals week',
      heading: 'How to Study for Finals Without Reviewing Everything',
      body: 'Upload your notes and Studymo identifies your gaps, builds your study plan, and generates practice exams — so you spend time on what matters.',
    },
    howItWorksSteps: [
      { title: 'Upload Everything at Once', sub: 'All your notes, slides, and recordings for every class.' },
      { title: 'Get Flashcards and a Practice Exam', sub: 'Full semester content organized and ready to review.' },
      { title: 'Fix What You Don\'t Know', sub: 'Use the weak topic list and AI tutor to close the gaps before exam day.' },
    ],
    bottomCTACopy:
      "Finals are coming whether you're ready or not. Try it free tonight.",
    utmCampaign: 'finals',
  },

  tutoring: {
    slug: 'tutoring',
    keyword: 'ai tutoring',
    title: 'AI Tutoring That Knows Your Course | Studymo',
    metaDescription:
      'Affordable AI tutoring available 24/7. Upload your course material and get an AI tutor that explains your content — at a fraction of private tutoring costs.',
    h1: 'Better Than a Tutor for Most of What You Need',
    subheadline:
      'Get clear explanations of your exact course material, available any time, at a fraction of the cost.',
    problemStatement:
      "Private tutors are expensive and hard to schedule. Khan Academy doesn't know your course. ChatGPT doesn't know what's on your exam. You need explanations of the specific content you're studying, from something you can access at midnight before a test.",
    midCTACopy:
      "You don't need to pay $70 an hour for conceptual explanations. Try the AI tutor free and see if it covers what you need.",
    features: [
      {
        headline: 'Learns from your course material',
        description:
          "Upload your notes, slides, or readings. The tutor answers from those, not from generic internet knowledge.",
      },
      {
        headline: "Never makes you feel stupid",
        description:
          'Ask the same question four different ways. It explains again, every time, without impatience.',
      },
      {
        headline: 'Available when you actually study',
        description:
          'Midnight, 6am, during lunch. No scheduling required, no cancellations.',
      },
      {
        headline: 'Costs less than one session',
        description:
          "A full month of Studymo costs less than a single hour with a private tutor. And it covers every subject.",
      },
      {
        headline: 'Does more than explain',
        description:
          'Flashcards, quizzes, podcasts, study plans. A private tutor can do one thing at a time. Studymo does all of it.',
      },
    ],
    socialProofQuotes: [
      {
        text: "I was paying $300 a month for a private tutor. Most sessions were the tutor explaining concepts I could've asked the AI directly. I switched and my grades didn't change.",
        name: 'Priya N., pre-law',
      },
      {
        text: "The AI never makes me feel dumb for asking basic questions. That's the thing I was always most anxious about with real tutors.",
        name: 'Marcus L., sophomore',
      },
      {
        text: "I study at 11pm. No tutor is available at 11pm. This is.",
        name: 'Caitlin B., junior',
      },
      {
        text: "I uploaded my econ textbook chapters and had 150 flashcards in the time it would've taken to type 10 by hand. That's the part that actually saves time.",
        name: 'Tyler J., senior',
      },
    ],
    faq: [
      {
        question: 'Can this replace a human tutor entirely?',
        answer:
          "For most studying, yes. If you need hands-on practice for something like lab work or music, a human is still useful. For conceptual explanations, reading comprehension, and exam prep, the AI covers most of what you'd use a tutor for.",
      },
      {
        question: 'How does the cost compare to private tutoring?',
        answer:
          "Private tutors typically charge $50 to $150 per hour depending on the subject and location. One month of Studymo is a fraction of that and covers every subject, any time.",
      },
      {
        question: 'Does the AI know every subject?',
        answer:
          "It has broad general knowledge, but it's most useful when you upload your specific course material. For niche subjects, the combination of your uploaded notes and the AI's reasoning is more reliable than general knowledge alone.",
      },
      {
        question: 'Can multiple students use the same account?',
        answer:
          "Accounts are individual. Each person has their own uploaded content, weak topics, and study plans.",
      },
      {
        question: 'What if I need help with a specific problem set?',
        answer:
          "You can ask the AI to walk through problem-solving approaches for specific question types. It's best for explaining method and concept rather than doing arithmetic or solving equations numerically.",
      },
    ],
    badge: 'Smarter than tutoring. Available all night.',
    screenshotAlt: 'Studymo online tutoring interface showing AI tutor answering questions from uploaded course material',
    learningStyleSection: {
      label: 'Smarter than a study guide',
      heading: 'Online Tutoring That Knows Your Exact Course',
      body: 'Upload your material and get a tutor that answers from it — not generic textbook knowledge — available any time you need it.',
    },
    howItWorksSteps: [
      { title: 'Upload Your Course Material', sub: 'Notes, slides, readings, or any URL from your class.' },
      { title: 'Get Study Tools Instantly', sub: 'Flashcards, quizzes, and organized notes from what you uploaded.' },
      { title: 'Ask the Tutor Anything', sub: 'Get clear explanations from your content, any time of day.' },
    ],
    bottomCTACopy:
      "Good tutoring shouldn't cost $80 an hour. Try it free.",
    utmCampaign: 'tutoring',
  },

  'quizlet-alternative': {
    slug: 'quizlet-alternative',
    keyword: 'quizlet alternative ai',
    title: 'Quizlet Alternative with AI Tutor | Studymo',
    metaDescription:
      'The Quizlet alternative with a built-in AI tutor. Auto-generated flashcards, practice exams, and weak topic tracking — no manual card creation.',
    h1: 'More Than Flashcards',
    subheadline:
      'Quizlet makes you study the material. Studymo helps you actually understand it.',
    problemStatement:
      "Flashcards are useful but limited. Matching a term to a definition doesn't tell you if you understand the concept. You can ace a Quizlet deck and still fail the exam. What you need is something that tests your understanding, not just your memory, and that tells you where the gaps are.",
    midCTACopy:
      "If you've been using Quizlet and still struggling on exams, the issue might not be how much you study. It might be how you study. Try a different approach.",
    isComparison: true,
    comparisonTarget: 'Quizlet',
    comparisonRows: [
      {
        feature: 'Flashcard generation',
        studymo: 'Auto-generated from uploads',
        competitor: 'Manual creation or user sets',
      },
      {
        feature: 'AI tutor',
        studymo: 'Yes, trained on your material',
        competitor: 'No',
      },
      {
        feature: 'Notes from uploads',
        studymo: 'Yes, from PDF, video, audio',
        competitor: 'No',
      },
      {
        feature: 'Practice exams',
        studymo: 'Yes, generated from your content',
        competitor: 'Basic test mode only',
      },
      {
        feature: 'Weak topic tracking',
        studymo: 'Yes, by concept',
        competitor: 'Shows cards you got wrong',
      },
      {
        feature: 'Podcast mode',
        studymo: 'Yes',
        competitor: 'No',
      },
    ],
    features: [
      {
        headline: 'Flashcards plus everything else',
        description:
          "You still get flashcards. You also get notes, quizzes, practice exams, a podcast, and a tutor from the same upload.",
      },
      {
        headline: 'AI generates flashcards from your content',
        description:
          "Upload a PDF and get a complete deck in minutes. No manually typing cards, no searching for someone else's set.",
      },
      {
        headline: 'Tutor to explain what the flashcard skips',
        description:
          "When you don't understand why, ask. Quizlet can't answer questions. Studymo can.",
      },
      {
        headline: 'Practice exams, not just matching games',
        description:
          "Generated practice exams prepare you for the actual test format, not just term recall.",
      },
      {
        headline: 'Tracks what you actually keep missing',
        description:
          "Not just what you rated hard. The system identifies the underlying concepts behind your wrong answers.",
      },
    ],
    socialProofQuotes: [
      {
        text: "I've used Quizlet for years and it never stopped me from blanking on exams. Studymo's practice tests actually prepare me for the format of the real thing.",
        name: 'Jenna L., junior',
      },
      {
        text: "The AI tutor is what changes everything. I can ask why something is true instead of just memorizing that it is.",
        name: 'Kwame A., sophomore',
      },
      {
        text: "I used to spend an hour making Quizlet cards for each lecture. Now I upload the PDF and have 80 cards in five minutes.",
        name: 'Sophie T., senior',
      },
      {
        text: "I stopped paying for Quizlet Plus when I realized Studymo does everything it does and more, for about the same price.",
        name: 'Ryan M., undergrad',
      },
    ],
    faq: [
      {
        question: "Can I import my existing Quizlet sets into Studymo?",
        answer:
          "Not directly. But if you paste the content into a document and upload it, Studymo generates flashcards from it. Most students find it easier to just upload their original source material.",
      },
      {
        question: "Does Studymo have the same learning modes as Quizlet?",
        answer:
          "It has flashcard review, quiz mode, and practice exam mode. It doesn't have games like Match. The focus is on tools that research shows improve retention, like retrieval practice.",
      },
      {
        question: "How is the flashcard quality compared to community sets on Quizlet?",
        answer:
          "Community sets on Quizlet vary a lot. Studymo generates cards from your specific course material, so they reflect your professor's content and terminology exactly. For your actual exams, that's usually better.",
      },
      {
        question: "Is Studymo more expensive than Quizlet?",
        answer:
          "Pricing is comparable. Studymo includes features Quizlet doesn't have at any price tier, including AI tutoring, notes generation, and practice exams.",
      },
      {
        question: "Can I share flashcard sets with classmates?",
        answer:
          "Notes can be shared with a link. Flashcard sharing across accounts is on the roadmap.",
      },
    ],
    badge: 'The Quizlet alternative with a real AI tutor',
    screenshotAlt: 'Studymo Quizlet alternative AI showing auto-generated flashcards, AI tutor, and practice exams from uploaded notes',
    learningStyleSection: {
      label: 'Beyond flashcards',
      heading: 'The Quizlet Alternative That Can Actually Tutor You',
      body: 'Auto-generated flashcards from your uploads, plus an AI tutor that explains what the card doesn\'t, practice exams, and weak topic tracking.',
    },
    howItWorksSteps: [
      { title: 'Upload Your Source Material', sub: 'PDFs, slides, recordings, or any URL — no manual card creation.' },
      { title: 'Get Flashcards and a Quiz', sub: 'A full deck and quiz generated from your content in minutes.' },
      { title: 'Study Beyond the Flashcard', sub: 'Ask the AI tutor when a card isn\'t enough to explain the concept.' },
    ],
    bottomCTACopy:
      "You've been studying. You deserve tools that actually work. Try it free.",
    utmCampaign: 'quizlet-alternative',
  },

  'coconote-alternative': {
    slug: 'coconote-alternative',
    keyword: 'coconote alternative',
    title: 'CocoNote Alternative with AI Tutoring | Studymo',
    metaDescription:
      'Studymo does everything CocoNote does, then goes further. Notes, flashcards, quizzes, study plans, and an AI tutor from the same upload.',
    h1: 'Notes Are Just the Start',
    subheadline:
      'CocoNote stops at notes. Studymo turns them into flashcards, quizzes, a study plan, and a tutor.',
    problemStatement:
      "Good notes help, but notes alone don't prepare you for an exam. You need to test yourself, fix what you don't know, and practice until the right answer is automatic. Taking notes is step one. Studymo handles everything after.",
    midCTACopy:
      "If you're already using an AI note-taking tool, you're halfway there. Studymo takes the same upload and gives you everything you need to actually study from it.",
    isComparison: true,
    comparisonTarget: 'CocoNote',
    comparisonRows: [
      {
        feature: 'AI note generation',
        studymo: 'Yes',
        competitor: 'Yes',
      },
      {
        feature: 'Flashcard generation',
        studymo: 'Yes, from notes automatically',
        competitor: 'No',
      },
      {
        feature: 'AI tutor',
        studymo: 'Yes, trained on your notes',
        competitor: 'No',
      },
      {
        feature: 'Practice exams',
        studymo: 'Yes',
        competitor: 'No',
      },
      {
        feature: 'Study plans',
        studymo: 'Yes, with test date scheduling',
        competitor: 'No',
      },
      {
        feature: 'Podcast mode',
        studymo: 'Yes',
        competitor: 'No',
      },
    ],
    features: [
      {
        headline: 'Generates notes like CocoNote does',
        description:
          "Upload audio, video, PDF, or a URL. Get organized notes from your actual content.",
      },
      {
        headline: 'Then turns those notes into flashcards',
        description:
          "One click. No copying content into a separate app. The flashcards come from the same upload.",
      },
      {
        headline: 'AI tutor that knows your notes',
        description:
          "Ask a question about anything in the uploaded material. The tutor answers from your content.",
      },
      {
        headline: 'Quiz yourself on the content',
        description:
          "Auto-generated quizzes from your material test you on the actual concepts, not just definitions.",
      },
      {
        headline: 'Study plans built around your exam date',
        description:
          "Set your test date and Studymo builds a day-by-day schedule from your uploaded material.",
      },
    ],
    socialProofQuotes: [
      {
        text: "I tried three AI note tools. They all did the same thing. Studymo actually does something with the notes after it makes them.",
        name: 'Zara A., junior',
      },
      {
        text: "The jump from notes to flashcards used to take me an hour. Now it takes one click.",
        name: 'Chris M., sophomore',
      },
      {
        text: "I didn't realize how much time I was wasting just organizing my notes. Studymo does that automatically and then gives me a quiz.",
        name: 'Lauren T., senior',
      },
      {
        text: "The study plan is what got me. I upload my lecture recordings, set my exam date, and know exactly what to study every day.",
        name: 'Omar S., pre-med',
      },
    ],
    faq: [
      {
        question: "Can I import notes I already made in CocoNote?",
        answer:
          "If you can export them as a PDF or text file, you can upload them to Studymo. The AI will generate flashcards, quizzes, and tutor context from them.",
      },
      {
        question: "Does Studymo record lectures directly?",
        answer:
          "Yes. You can record audio directly in the app. Studymo transcribes it and generates notes, flashcards, and a quiz from the recording.",
      },
      {
        question: "How is the note quality compared to CocoNote?",
        answer:
          "Note quality from audio is comparable. For uploaded PDFs and videos, Studymo organizes content into structured notes with headers and key points. The format may differ from CocoNote's style but covers the same material.",
      },
      {
        question: "Is Studymo better for studying or note-taking?",
        answer:
          "Both. The note generation is the starting point. The flashcards, quizzes, tutor, and study plan are what you use to prepare for exams. It's designed to be a complete study workflow, not just a notes app.",
      },
      {
        question: "Does it work offline?",
        answer:
          "The app requires a connection to generate content. Once notes and flashcards are generated, you can review them. Full offline mode is not available.",
      },
    ],
    badge: 'Notes plus the tools to actually study them',
    screenshotAlt: 'Studymo CocoNote alternative showing AI notes, flashcards, quiz, and study plan from one upload',
    learningStyleSection: {
      label: 'Notes plus everything else',
      heading: 'One Upload. Notes, Flashcards, Quizzes, and a Tutor.',
      body: 'Same upload you\'d do in CocoNote. What you get back covers the full study workflow, not just the notes.',
    },
    howItWorksSteps: [
      { title: 'Upload Like You Normally Would', sub: 'Audio, video, PDF, or URL — same as any note tool.' },
      { title: 'Get Notes Plus Flashcards and a Quiz', sub: 'Everything CocoNote gives you, plus study tools built from it.' },
      { title: 'Study With the AI Tutor', sub: 'Ask questions about your notes any time, without switching apps.' },
    ],
    bottomCTACopy:
      "You already know notes help. Now use tools that go further. Try it free.",
    utmCampaign: 'coconote-alternative',
  },

  'chatgpt-vs-studymo': {
    slug: 'chatgpt-vs-studymo',
    keyword: 'how to use chatgpt for studying',
    title: 'ChatGPT for Studying vs Studymo | Studymo',
    metaDescription:
      'Using ChatGPT for studying works — until it doesn\'t know your syllabus. Studymo knows your course material and builds flashcards, quizzes, and practice exams from it.',
    h1: 'ChatGPT for Studying Is a Start. This Goes Further.',
    subheadline:
      'ChatGPT prompts for studying help. Studymo goes further — it knows your course material and builds tools from it.',
    problemStatement:
      "ChatGPT is useful for explaining concepts. But it doesn't know your textbook, your professor's slides, or what's on your specific exam. You end up re-explaining your material every session. Studymo already knows your material because you uploaded it once.",
    midCTACopy:
      "If you've been using ChatGPT to study and re-explaining your course content every session, there's a faster way.",
    isComparison: true,
    comparisonTarget: 'ChatGPT',
    comparisonRows: [
      {
        feature: 'Knows your course material',
        studymo: 'Yes, from your uploads',
        competitor: 'No, you re-explain each session',
      },
      {
        feature: 'Generates flashcards',
        studymo: 'Yes, from your content',
        competitor: 'No',
      },
      {
        feature: 'Generates quizzes',
        studymo: 'Yes, from your content',
        competitor: 'No',
      },
      {
        feature: 'Tracks what you get wrong',
        studymo: 'Yes, persists across sessions',
        competitor: 'No, forgets each session',
      },
      {
        feature: 'Study plans',
        studymo: 'Yes, built from your material',
        competitor: 'No',
      },
      {
        feature: 'Podcast mode',
        studymo: 'Yes',
        competitor: 'No',
      },
    ],
    features: [
      {
        headline: 'Knows your specific content',
        description:
          "Upload your notes once. Every tutor response, quiz, and flashcard is built from your material, not generic internet knowledge.",
      },
      {
        headline: 'Generates study tools, not just answers',
        description:
          "Flashcards, quizzes, practice exams, podcasts, study plans. ChatGPT answers questions. Studymo builds a complete study workflow.",
      },
      {
        headline: 'Remembers across sessions',
        description:
          "Your weak topics, uploaded content, and study history persist. ChatGPT starts from scratch every conversation.",
      },
      {
        headline: 'Built for exam prep',
        description:
          "Practice exams, timed tests, question-by-question feedback. Not just chat.",
      },
      {
        headline: 'No prompt engineering required',
        description:
          "Upload your material and click generate. You don't need to learn how to write prompts to get useful output.",
      },
    ],
    socialProofQuotes: [
      {
        text: "I was copy-pasting my lecture notes into ChatGPT every session just to get relevant answers. With Studymo I upload once and it knows everything.",
        name: 'Emily S., pre-med',
      },
      {
        text: "ChatGPT is great for general questions. Studymo is better for exam prep because it actually tests you.",
        name: 'Jared K., senior',
      },
      {
        text: "The thing that sold me was the weak topic tracker. ChatGPT doesn't remember what I got wrong last week. Studymo does.",
        name: 'Mia T., junior',
      },
      {
        text: "I stopped paying for ChatGPT Plus when I realized Studymo does more for studying at a similar price.",
        name: 'Daniel R., sophomore',
      },
    ],
    faq: [
      {
        question: "Is the AI tutor in Studymo as capable as ChatGPT?",
        answer:
          "Studymo's tutor is built on capable AI and is optimized for studying. It may not handle creative writing or coding as well as ChatGPT, but for explaining course concepts and answering questions about your uploaded material, it performs comparably.",
      },
      {
        question: "Can I still use ChatGPT alongside Studymo?",
        answer:
          "Yes. Many students use ChatGPT for general questions or writing help, and Studymo for course-specific studying, flashcards, and exam prep. They serve different purposes.",
      },
      {
        question: "Does Studymo use ChatGPT or a different AI?",
        answer:
          "Studymo uses its own AI infrastructure optimized for education. The underlying models are different from ChatGPT.",
      },
      {
        question: "How does Studymo remember my material across sessions?",
        answer:
          "Your uploaded documents are stored in your account. The AI tutor draws from them in every session. Your weak topics and quiz history also persist, so the system learns your gaps over time.",
      },
      {
        question: "Is Studymo better for all subjects or specific ones?",
        answer:
          "It works well for most subjects where studying involves reading and conceptual understanding. It's particularly useful for sciences, social sciences, history, law, and nursing. Math works for concept review; less so for step-by-step problem solving.",
      },
    ],
    badge: 'Better than ChatGPT prompts for studying',
    screenshotAlt: 'Studymo vs ChatGPT for studying — AI that knows your course material and generates flashcards and practice exams',
    learningStyleSection: {
      label: 'Built for your exam, not the internet',
      heading: 'ChatGPT for Studying Gets You Halfway There',
      body: 'Good ChatGPT prompts for studying help explain concepts. Studymo goes further — it knows your material, builds your flashcards, and tracks what you get wrong.',
    },
    howItWorksSteps: [
      { title: 'Upload Your Course Material Once', sub: 'PDFs, slides, YouTube lectures, or audio recordings.' },
      { title: 'Get Study Tools Built From It', sub: 'Notes, flashcards, quizzes, and a podcast — automatically.' },
      { title: 'Ask a Tutor That Already Knows Your Content', sub: 'No re-explaining your material every session.' },
    ],
    bottomCTACopy:
      "Use the right tool for studying. Try Studymo free.",
    utmCampaign: 'chatgpt-vs-studymo',
  },
};
