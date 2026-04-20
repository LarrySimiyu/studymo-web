import QuickAnswer from '@/components/blog/QuickAnswer';
import Callout from '@/components/blog/Callout';
import FeatureCard from '@/components/blog/FeatureCard';
import CTABlock from '@/components/blog/CTABlock';
import FAQ from '@/components/blog/FAQ';

export default function Post() {
  return (
    <div>
      <p>
        Finals week is when most students discover they spent the semester reviewing material
        they already understood. It feels like studying. The problem is the topics you actually
        don't know tend to get left for last, and last usually means the night before.
      </p>

      <QuickAnswer answer="Start at least a week out. List every topic the exam covers and sort by how confident you feel. Study the weakest areas first, not last. Use practice tests under timed conditions. Space your sessions across multiple days instead of one marathon. Get 7-8 hours of sleep before the exam. Sleep is when memory consolidation happens, and skipping it costs more than an extra hour of reviewing does." />

      <h2>How far in advance should you start studying for finals?</h2>
      <p>
        A week is the minimum. Two weeks gives you time to space your review out, which is how
        retention actually works: reviewing material across multiple sessions with gaps between
        them instead of one long push.
      </p>
      <p>
        If you're starting three days out, you're cramming. That produces recognition, not recall.
        You'll know an answer when you see it but struggle to produce it from scratch. On most
        exams, that's not enough.
      </p>

      <h2>What study methods actually work for finals?</h2>
      <p>
        Practice testing. Find past exams, generate practice questions, work through them timed,
        and check your answers. The act of retrieving information under pressure is what trains
        your brain to do it when it actually counts.
      </p>
      <p>
        Active recall beats re-reading. Quizzing yourself, doing practice problems, explaining
        a topic out loud to an empty room. All of these require you to produce the answer rather
        than just recognize it. Re-reading feels like studying. It rarely builds the kind of
        memory that holds up on a test.
      </p>

      <Callout type="tip">
        After each practice question you get wrong, write a one-sentence explanation of why the
        correct answer is right. That active processing locks in the correction far better than
        just noting the right answer and moving on.
      </Callout>

      <h2>How do you study for finals in college?</h2>
      <p>
        College finals often cover 3-4 months of material, which means you can't review
        everything. You have to choose. Sort topics by how much they're worth on the exam and
        by how confident you actually feel about them. The gap between those two rankings is
        where your time should go.
      </p>
      <p>
        If your professor posted a study guide, treat every item as likely to appear. Go through
        it, rate your confidence honestly, and start with the low-confidence ones. The material
        you already know is not where your exam points are coming from.
      </p>
      <p>
        That structure also removes the decision fatigue of figuring out what to review each
        session. Students who skip the planning step tend to default to re-reading material
        they're comfortable with, which is exactly the wrong use of finals week.
      </p>

      <FeatureCard
        title="Study Plan + Weak Topic Tracking"
        description="Upload your notes before finals and Studymo builds a study schedule around the topics you're most likely to get wrong, not the ones you already know."
        href="/sign-up"
      />

      <h2>How do you study for finals in high school?</h2>
      <p>
        High school finals are usually more predictable than college exams. Your teacher will
        often tell you exactly what's covered. Get that information, get any study guides, and
        build your review around those specifically.
      </p>
      <p>
        Same strategy: sort by confidence, focus on gaps, use practice questions, space your
        sessions. High school finals tend to be more targeted, so if you're organized you can
        cover the material faster than it feels like you can.
      </p>
      <p>
        For math finals specifically: work problems, not notes. Reading about how to solve a
        type of problem does almost nothing. Doing 10 practice problems per concept does a lot.
      </p>

      <h2>What if you only have one day left?</h2>
      <p>
        Pick 5-6 topics. The ones most likely to appear and that you feel least confident about.
        Don't try to cover everything.
      </p>
      <p>
        One practice set per topic. Focus on understanding why your wrong answers were wrong.
        Eat something real, sleep as much as you can. A rested brain on exam day outperforms
        an exhausted one that reviewed for four extra hours. That's not motivational advice.
        That's just how memory recall works under fatigue.
      </p>

      <CTABlock
        headline="Build your finals study plan in minutes"
        body="Upload your notes and Studymo maps out what to review each day, organized around your weakest topics so you're not guessing where to spend your time."
      />

      <FAQ items={[
        {
          question: "How many hours should you study for finals?",
          answer: "There's no fixed number that matters. Spreading sessions across days and focusing on weak areas will do more than any particular hour count. 2-3 focused hours per day over a week beats 12 hours the day before."
        },
        {
          question: "Is it better to study the night before a final?",
          answer: "Light review is fine. A full study session the night before usually hurts. You sacrifice sleep, and sleep is when memory consolidation happens. Review key concepts briefly, then prioritize sleep."
        },
        {
          question: "How do you get motivated to study for finals?",
          answer: "Start with something specific and small, not 'study chemistry' but 'do 10 practice problems on equilibrium.' Starting is usually harder than continuing. Remove your phone from the room before you sit down, not just flip it over."
        },
        {
          question: "How do you deal with finals anxiety?",
          answer: "Preparation is the most reliable fix. Knowing your weak areas and having reviewed them specifically is more calming than having studied for many hours without a clear system. Vague effort produces more anxiety, not less."
        },
        {
          question: "How do you study for finals in a day?",
          answer: "Triage. Pick the 5-6 highest-priority topics, do one focused practice set on each, and leave time to sleep. Covering a little of everything is almost always worse than covering a few things well."
        }
      ]} />
    </div>
  );
}
