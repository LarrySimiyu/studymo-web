import QuickAnswer from '@/components/blog/QuickAnswer';
import Callout from '@/components/blog/Callout';
import FeatureCard from '@/components/blog/FeatureCard';
import CTABlock from '@/components/blog/CTABlock';
import FAQ from '@/components/blog/FAQ';

export default function Post() {
  return (
    <div>
      <p>
        If you have ADHD, the standard study advice often makes things worse. Sitting still for
        two hours, re-reading the same chapter, highlighting everything. These fight how your
        brain actually works. The strategies that help are different, and once you find them,
        studying gets a lot more manageable.
      </p>

      <QuickAnswer answer="Study in 20-25 minute blocks with short breaks in between. Use active recall: get tested on the material instead of just reading it. Remove distractions before you sit down, not during. Match your format to your energy: if re-reading isn't working, switch to flashcards, audio, or talking through the concept. Set a specific goal for each session so you know when you're done." />

      <h2>Why does re-reading go nowhere when you have ADHD?</h2>
      <p>
        Passive review is boring, and ADHD brains disengage from boring tasks fast. When you
        re-read the same paragraph three times and absorb nothing, that's not a willpower problem.
        Your brain needs stimulation to stay engaged. Running your eyes over static text doesn't
        provide it.
      </p>
      <p>
        Active recall works better because it's inherently more engaging. You're trying to retrieve
        something, which requires real mental effort. Flashcards, practice questions, and talking
        through a concept out loud all force that retrieval loop. That's what actually builds
        memory.
      </p>

      <h2>What study schedule actually works for ADHD?</h2>
      <p>
        Short, defined sessions beat long open-ended ones. The Pomodoro method (25 minutes on,
        5 minutes off) works well for ADHD because your brain knows there's an endpoint. Knowing
        the session ends in 20 minutes is easier to commit to than "study until you're done."
      </p>
      <p>
        Two focused 25-minute blocks will produce better results than one unfocused 90-minute
        stretch. If you're losing focus at 15 minutes, start with 15-minute sessions and build
        from there.
      </p>
      <p>
        Body doubling helps too. Working alongside someone, even virtually over video, creates
        enough social presence to keep you on task. A lot of people who struggle studying alone
        do fine in a library or with a study partner on screen.
      </p>

      <h2>How do you study effectively with ADHD without medication?</h2>
      <p>
        Structure replaces the focus that medication helps provide. Study at the same time each
        day. Use a physical checklist to track what you've covered. Put your phone in a different
        room before you start, not face down on the desk.
      </p>
      <p>
        Audio review helps when reading feels impossible. If you've uploaded your course material
        to Studymo, you can turn your notes into a podcast-style audio lecture and listen while
        moving around. For a lot of students who struggle to study with ADHD, moving while listening
        works far better than sitting still and staring at a page.
      </p>

      <Callout type="tip">
        Set one specific goal before every session: "review the three types of chemical bonding"
        not "study chemistry." A clear endpoint makes it much easier to start and reduces the
        chance your brain wanders mid-session.
      </Callout>

      <h2>How do you prepare for exams when you have ADHD?</h2>
      <p>
        Start earlier than you think you need to. Cramming is hard for everyone, but it's
        especially hard when you have ADHD. You need multiple spaced sessions to retain
        information reliably. A single marathon review the night before rarely holds.
      </p>
      <p>
        Build your review around what you don't know. Go through your quiz results or any
        practice tests you've taken and find the concepts you're consistently missing. Studying
        and retaining information with ADHD gets easier when you have a clear, narrow target
        rather than trying to cover everything at once.
      </p>

      <FeatureCard
        title="Studymo AI Tutor"
        description="When re-reading stops working, switch to a back-and-forth conversation about the material. The tutor pulls from your actual notes, so explanations stay relevant to your course, not generic definitions."
        href="/sign-up"
      />

      <CTABlock
        headline="Study smarter with ADHD"
        body="Studymo turns your notes into flashcards, quizzes, and audio lectures: study formats that actually work for how your brain processes information."
      />

      <FAQ items={[
        {
          question: "How long should a study session be for someone with ADHD?",
          answer: "Start with 15-25 minute sessions. That's short enough to commit to, long enough to make progress. Add breaks every session and increase duration only if focus holds."
        },
        {
          question: "Can you get good grades with ADHD?",
          answer: "Yes. ADHD makes standard study methods less effective, not learning impossible. Students who find strategies that match how their brain works, like active recall, short sessions, and low-distraction environments, consistently perform well."
        },
        {
          question: "What is the best environment to study in with ADHD?",
          answer: "Quiet, minimal visual clutter, phone out of reach. Some people focus better with background noise like white noise or lo-fi music. Experiment and see what reduces mental drift for you specifically."
        },
        {
          question: "Is the Pomodoro technique good for ADHD?",
          answer: "Yes, for most people. Short defined work intervals with built-in breaks match ADHD attention patterns well. 25/5 is the standard, but 20/5 or 15/5 works better for some. Use whichever keeps you actually working during the on period."
        },
        {
          question: "How do you study for exams with ADHD?",
          answer: "Spread review across multiple days rather than cramming. Focus on your weak spots first. Use practice tests under realistic conditions. Keep individual sessions short and take real breaks."
        }
      ]} />
    </div>
  );
}
