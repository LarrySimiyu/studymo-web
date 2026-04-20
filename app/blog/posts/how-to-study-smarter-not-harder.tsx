import QuickAnswer from '@/components/blog/QuickAnswer';
import PullQuote from '@/components/blog/PullQuote';
import FeatureCard from '@/components/blog/FeatureCard';
import CTABlock from '@/components/blog/CTABlock';
import FAQ from '@/components/blog/FAQ';

export default function Post() {
  return (
    <div>
      <p>
        Studying smarter means spending your time on methods that build retention: active recall,
        spaced repetition, and focusing on what you don't know yet. It doesn't mean studying less.
        It means replacing techniques that feel productive but don't stick with ones that do.
      </p>

      <QuickAnswer answer="Stop re-reading and start testing yourself. Spread your study sessions across multiple days with gaps in between. That spacing is what moves information into long-term memory. Spend most of your time on topics you're weak on, not the ones you're comfortable with. Use practice tests under realistic conditions before the real exam. Protect your sleep. Memory consolidation happens during sleep, not during extra study hours." />

      <h2>Why does studying harder often not work?</h2>
      <p>
        Most students put in hours without thinking about the quality of the method. Re-reading
        feels productive because it's familiar. But research consistently shows it's one of the
        weakest ways to build long-term memory.
      </p>
      <p>
        The issue is recognition vs. recall. When you re-read material, it feels familiar, which
        your brain interprets as knowing it. But recognition and recall are different skills.
        Exams test recall: producing the right answer from scratch, not identifying it when you
        see it.
      </p>
      <p>
        The same hours spent doing practice questions, testing yourself with flashcards, or
        explaining concepts from memory produce far better results. That's the core of studying
        smarter.
      </p>

      <h2>What's the difference between active and passive studying?</h2>
      <p>
        Passive studying: re-reading notes, highlighting, watching videos, copying content.
        Active studying: answering questions, explaining concepts from memory, solving problems
        without looking at your notes.
      </p>
      <p>
        Passive methods feel easier because they are. There's no mental strain in re-reading.
        But that strain is exactly what builds memory. Every time you retrieve a piece of
        information, you strengthen the neural pathway to it. Passive review doesn't trigger
        that retrieval process.
      </p>

      <PullQuote>
        Practice tests, retrieval, and explaining from scratch feel hardest in the moment.
        Those are also the methods that work best. Difficulty is the signal, not the problem.
      </PullQuote>

      <h2>How does spaced repetition help you retain information?</h2>
      <p>
        Spaced repetition means reviewing material at increasing intervals over time. Study
        something today, review it tomorrow, then in three days, then a week later. Each review
        session reinforces the memory right before it would fade.
      </p>
      <p>
        In practice: don't do all your studying in one session. Spread it across days. If you
        use flashcards, mix in older material alongside new cards. The goal is to keep returning
        to things before you forget them, not to cram everything the night before.
      </p>
      <p>
        This is why students who start studying two weeks before an exam consistently outperform
        students who study for the same number of hours but crammed them into two days.
      </p>

      <h2>How do you know what to focus on?</h2>
      <p>
        Track what you get wrong. Most students have no system for this. They finish a practice
        quiz, check the answers, and move on without recording which concepts they missed.
      </p>
      <p>
        Studymo automatically tracks your weak topics across every quiz and practice exam you
        take. You can see exactly which concepts you're getting wrong most often and build your
        next study session around those, instead of defaulting to the material you're already
        comfortable with. That alone closes the gap faster than anything else.
      </p>

      <FeatureCard
        title="Weak Topic Tracking"
        description="Every quiz you take in Studymo records what you got wrong. Your weak topic list updates automatically so you always know where to focus, without any guessing."
        href="/sign-up"
      />

      <h2>How do you study smarter when you're short on time?</h2>
      <p>
        Triage. Identify the highest-priority topics: the ones most likely to appear on the
        exam and that you feel least confident about. Go deep on those only. Covering a
        little of everything when you're pressed for time is almost always worse than covering
        a few things well.
      </p>
      <p>
        Do one practice set per topic. Check your answers. Understand why each wrong answer
        was wrong. That's it. You'll retain more from 90 focused minutes than from 4 scattered
        ones.
      </p>

      <CTABlock
        headline="Study smarter, starting today"
        body="Studymo tracks every question you get wrong and builds your next study session around those gaps, so you're always working on what matters most."
      />

      <FAQ items={[
        {
          question: "What does it mean to study smarter not harder?",
          answer: "It means using methods proven to build long-term retention, like active recall, spaced repetition, and practice testing. Not passive ones like re-reading. The goal is more retained knowledge per hour, not fewer hours overall."
        },
        {
          question: "How many hours a day should a student study?",
          answer: "Quality matters more than quantity. Two focused hours using active recall will outperform five hours of passive re-reading. Most students see good results with 2-4 focused hours per day during high-study periods."
        },
        {
          question: "What is the most effective study technique?",
          answer: "Practice testing is the most consistently effective method across subjects and levels. Taking a test on the material, before you feel fully ready, builds recall better than any other technique."
        },
        {
          question: "Does highlighting help you study?",
          answer: "Mostly no. Highlighting while reading is a passive activity. It gives the illusion of engaging with material without actually testing your memory. It can help you locate information later, but it doesn't build retention on its own."
        },
        {
          question: "How do you retain information better while studying?",
          answer: "Test yourself instead of re-reading. Space your sessions across days. Review material you've already learned before starting new content. Sleep enough. Memory consolidation requires it."
        }
      ]} />
    </div>
  );
}
