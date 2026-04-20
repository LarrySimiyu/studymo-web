import QuickAnswer from '@/components/blog/QuickAnswer';
import PullQuote from '@/components/blog/PullQuote';
import FeatureCard from '@/components/blog/FeatureCard';
import CTABlock from '@/components/blog/CTABlock';
import FAQ from '@/components/blog/FAQ';

export default function Post() {
  return (
    <div>
      <p>
        Most students study the same way they always have, even when it stops working. Re-read
        the notes, maybe make flashcards the night before, hope something sticks. The problem
        usually isn't effort. It's the method.
      </p>

      <QuickAnswer answer="Stop re-reading and start testing yourself. Spread your study sessions across multiple days with gaps in between. That spacing is what moves information into long-term memory. Spend most of your time on topics you're weak on, not the ones you're comfortable with. Use practice tests under realistic conditions before the real exam. Protect your sleep. Memory consolidation happens during sleep, not during extra study hours." />

      <h2>Why does studying harder often not work?</h2>
      <p>
        Re-reading feels like studying. You're looking at the material, you recognize the
        concepts, it feels familiar. But familiar and retrievable are different things, and
        exams test the second one. You can't just pick the option that looks right. You have
        to pull the answer from nothing.
      </p>
      <p>
        That's the gap most students don't notice until after the test. The material felt like
        they knew it. They just couldn't produce it when it counted.
      </p>

      <h2>What's the difference between active and passive studying?</h2>
      <p>
        Passive studying is anything where your brain is mostly a passenger: re-reading,
        highlighting, watching recordings, copying notes. Active studying requires it to
        produce something: an answer, an explanation, a solution without looking at your notes.
      </p>
      <p>
        The frustrating part is that passive methods feel more comfortable. There's no strain
        in re-reading. But that strain is actually the mechanism. Every time you successfully
        pull something from memory, that pathway gets a little stronger. Passive review skips
        that step entirely.
      </p>

      <PullQuote>
        Practice tests, retrieval, and explaining from scratch feel hardest in the moment.
        Those are also the methods that work best. Difficulty is the signal, not the problem.
      </PullQuote>

      <h2>How does spaced repetition help you retain information?</h2>
      <p>
        Instead of reviewing everything in one long session, you spread it out. Study something
        today, come back to it in a few days, then again a week later. Each time you return
        to it just before it fades, the memory gets reinforced and lasts longer.
      </p>
      <p>
        In practice, this mostly just means don't cram. Students who spread the same number
        of study hours across two weeks consistently outperform students who pack those hours
        into the last two days. It's not really a study tip. It's how memory consolidation
        works.
      </p>

      <h2>How do you know what to focus on?</h2>
      <p>
        Most students finish a practice quiz, check the answers, and move on. No record of
        which concepts they're actually missing, so they keep reviewing everything instead of
        the things that need work.
      </p>
      <p>
        Studymo tracks your weak topics every time you take a quiz. You end up with a real
        list of what you're getting wrong, not what you think you might be weak on. It's a
        small thing, but it changes how you prep for an exam more than almost anything else.
      </p>

      <FeatureCard
        title="Weak Topic Tracking"
        description="Every quiz you take in Studymo records what you got wrong. Your weak topic list updates automatically so you always know where to focus, without any guessing."
        href="/sign-up"
      />

      <h2>How do you study smarter when you're short on time?</h2>
      <p>
        Pick the 3-4 topics most likely to appear on the exam and that you feel least confident
        about. That's the whole plan. When time is short, covering a little of everything is
        almost always worse than covering a few things well.
      </p>
      <p>
        One practice set per topic. Review what you got wrong. Understand why each one was
        wrong. If you can do that honestly, you're done. Ninety focused minutes like that will
        do more than four hours of anxious re-reading.
      </p>

      <CTABlock
        headline="Study smarter, starting today"
        body="Studymo tracks every question you get wrong and builds your next study session around those gaps, so you're always working on what matters most."
      />

      <FAQ items={[
        {
          question: "What does it mean to study smarter not harder?",
          answer: "It means using methods that actually build memory instead of ones that feel productive. Active recall, spaced repetition, practice testing. Not re-reading the same page four times. The goal is more retained knowledge per hour, not fewer hours."
        },
        {
          question: "How many hours a day should a student study?",
          answer: "Honestly, quality matters more than the number. Two focused hours of active recall will outperform five hours of passive re-reading most of the time. During heavy study periods, 2-4 focused hours per day is a reasonable range."
        },
        {
          question: "What is the most effective study technique?",
          answer: "Practice testing. Taking a test on the material before you feel fully ready builds recall better than anything else. It's uncomfortable, which is part of why it works."
        },
        {
          question: "Does highlighting help you study?",
          answer: "Not really. It gives the feeling of engaging with material without actually testing whether you can recall it. It can help you find things later, but it doesn't build the kind of memory that holds up on an exam."
        },
        {
          question: "How do you retain information better while studying?",
          answer: "Test yourself instead of re-reading. Space your sessions across days. Sleep enough. Your brain consolidates memory during sleep, not during the extra hour of studying you're sacrificing for it."
        }
      ]} />
    </div>
  );
}
