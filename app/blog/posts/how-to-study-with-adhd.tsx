import QuickAnswer from '@/components/blog/QuickAnswer';
import Callout from '@/components/blog/Callout';
import FeatureCard from '@/components/blog/FeatureCard';
import CTABlock from '@/components/blog/CTABlock';
import FAQ from '@/components/blog/FAQ';

export default function Post() {
  return (
    <div>
      <p>
        The standard study advice (sit down, read the chapter, take notes, repeat) was not
        designed with ADHD in mind. Sitting still for two hours re-reading the same page doesn't
        work when your brain disengages from low-stimulation tasks in minutes. The strategies
        that actually help are different, and once you find them, studying gets a lot more
        manageable.
      </p>

      <QuickAnswer answer="Study in 20-25 minute blocks with short breaks in between. Use active recall: get tested on the material instead of just reading it. Remove distractions before you sit down, not during. Match your format to your energy: if re-reading isn't working, switch to flashcards, audio, or talking through the concept. Set a specific goal for each session so you know when you're done." />

      <h2>Why does re-reading go nowhere when you have ADHD?</h2>
      <p>
        Passive review is boring, and ADHD brains disengage from boring things fast. When you've
        read the same paragraph three times and absorbed nothing, that's not a willpower problem
        you can push through. Your brain needs something to actually do.
      </p>
      <p>
        Active recall works better because it's inherently more engaging. Trying to retrieve
        information requires real mental effort. Flashcards, practice questions, talking through
        a concept out loud. All of these force that. Re-reading doesn't.
      </p>

      <h2>What study schedule actually works for ADHD?</h2>
      <p>
        Short sessions with clear endpoints. The Pomodoro method (25 minutes on, 5 minutes off)
        works well for ADHD because your brain knows when it's going to be over. "Study until
        you're done" is an open-ended instruction that's hard to start and easy to abandon.
        "Study for 25 minutes" is something you can actually commit to.
      </p>
      <p>
        Two focused 25-minute blocks will outperform one vague 90-minute stretch. If you're
        losing focus at 15 minutes, start there and build from whatever you can actually sustain.
      </p>
      <p>
        Body doubling also helps more than most people expect. Studying alongside someone, even
        on video, creates enough social presence to keep you on task. A lot of people who can't
        study alone in their room do fine in a library or with a study partner on screen.
      </p>

      <h2>How do you study effectively with ADHD without medication?</h2>
      <p>
        Structure does a lot of what medication helps with. Study at the same time each day if
        you can. Use a physical checklist instead of trying to remember what you've covered.
        Phone in another room before you sit down, not face down on the desk. In another room.
      </p>
      <p>
        Audio review is worth trying when reading feels impossible. If you've uploaded your
        notes to Studymo, you can listen to them as an audio lecture while moving around. For a
        lot of people with ADHD, moving while listening works far better than sitting still and
        staring at a page.
      </p>

      <Callout type="tip">
        Set one specific goal before every session: "review the three types of chemical bonding"
        not "study chemistry." A clear endpoint makes it much easier to start and reduces the
        chance your brain wanders mid-session.
      </Callout>

      <h2>How do you prepare for exams when you have ADHD?</h2>
      <p>
        Start earlier than feels necessary. Cramming is hard for anyone, but ADHD makes it
        worse. You need multiple spaced sessions for information to consolidate, and a single
        marathon review the night before rarely sticks.
      </p>
      <p>
        Build your review around what you actually don't know. Go through quiz results or
        practice tests and find the concepts you keep missing. A narrow, specific target is much
        easier to stay with than "review everything."
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
          answer: "Start with 15-25 minute sessions. Short enough to actually commit to, long enough to make real progress. Add breaks every session and only increase the duration if your focus is actually holding."
        },
        {
          question: "Can you get good grades with ADHD?",
          answer: "Yes. ADHD makes standard study methods less effective, not learning impossible. Students who find methods that work for how their brain operates, like active recall, short sessions, and low-distraction environments, do well consistently."
        },
        {
          question: "What is the best environment to study in with ADHD?",
          answer: "Quiet, minimal visual clutter, phone out of reach. Some people focus better with background noise like white noise or lo-fi music. Experiment and pay attention to what actually reduces drift for you, not what sounds like it should."
        },
        {
          question: "Is the Pomodoro technique good for ADHD?",
          answer: "For most people, yes. Short defined work intervals with built-in breaks match ADHD attention patterns well. 25/5 is the standard starting point, but 20/5 or 15/5 works better for some. Use whatever keeps you actually working during the on period."
        },
        {
          question: "How do you study for exams with ADHD?",
          answer: "Spread review across multiple days rather than cramming. Focus on weak spots first. Use practice tests under realistic conditions. Keep sessions short and take real breaks between them."
        }
      ]} />
    </div>
  );
}
