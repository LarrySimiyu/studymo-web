import QuickAnswer from '@/components/blog/QuickAnswer';
import Callout from '@/components/blog/Callout';
import FeatureCard from '@/components/blog/FeatureCard';
import CTABlock from '@/components/blog/CTABlock';
import FAQ from '@/components/blog/FAQ';

export default function Post() {
  return (
    <div>
      <p>
        Good chemistry notes focus on what you need to solve problems and pass exams — reaction
        mechanisms, key equations, and concept definitions in plain language. Most students take
        notes that are either too long, too disorganized, or too close to a word-for-word
        transcript of the lecture. None of those help when you're reviewing.
      </p>

      <QuickAnswer answer="Organize chemistry notes by concept, not by lecture date. For each concept, capture: the definition, the key equation or reaction, a worked example, and any exceptions. Use consistent shorthand. Aim for one page per major topic — if it's longer, you're probably capturing too much. Review within 24 hours of the lecture while details are still fresh." />

      <h2>How should you take notes in chemistry class?</h2>
      <p>
        Don't try to write down everything. Chemistry lectures move fast, and trying to copy
        every word leaves no mental bandwidth to actually follow the logic.
      </p>
      <p>
        Focus on three things: the concept being taught, the key equation or mechanism, and any
        worked examples the professor walks through step by step. Those examples show you how
        to apply the concept — they're more useful than the definition alone.
      </p>
      <p>
        After class, rewrite or reorganize your raw notes while the lecture is still fresh.
        That second pass is where the actual learning happens. You're forced to reconstruct
        the logic rather than just copy it, which builds understanding much faster than
        re-reading later.
      </p>

      <h2>What's the best format for chemistry notes?</h2>
      <p>
        A structured layout works better than prose for chemistry. For each reaction or concept,
        capture: the name, the equation or mechanism, the conditions it requires, and a worked
        example. That format makes review fast — you can scan for what you need instead of
        reading through paragraphs.
      </p>
      <p>
        For organic chemistry notes specifically, draw the mechanisms rather than describing
        them in words. Visual representations of electron movement stick better than written
        descriptions. Label each arrow with what it represents.
      </p>

      <Callout type="note">
        Color coding helps in chemistry when used with restraint. One color for reactions,
        another for conditions, another for exceptions. More than three colors and the system
        starts working against you.
      </Callout>

      <h2>How do you take AP chemistry notes?</h2>
      <p>
        AP chemistry covers a lot of ground across 9 units, so organization matters more here
        than in most courses. Keep a separate section per unit — electrochemistry, kinetics,
        equilibrium — and use the structured format above within each.
      </p>
      <p>
        For foundational concepts like AP chemistry unit 1, make sure your notes include the
        key formulas with units, the conceptual explanation behind each formula, and at least
        one worked problem per formula. That combination — what it is, why it works, and how
        to use it — is what you need for the AP exam.
      </p>
      <p>
        AP chemistry free response questions require you to explain reasoning, not just calculate.
        Your notes should reflect that — capture the "why" behind each concept, not just
        the formula.
      </p>

      <h2>What about organic chemistry notes?</h2>
      <p>
        Organic chemistry notes need to emphasize reaction pathways and mechanisms more than
        definitions. For each reaction type, note: the reactants, conditions, products, and
        the mechanism step by step.
      </p>
      <p>
        Build a reaction map as you progress through the course — a visual guide showing how
        functional groups connect through different reaction types. Most students who struggle
        with orgo are missing this big-picture view of how reactions relate to each other.
      </p>

      <FeatureCard
        title="AI Note Generation from Lecture Files"
        description="Upload your chemistry lecture slides or PDFs and Studymo generates organized notes structured by concept — key equations, definitions, and worked examples pulled out and formatted for review."
        href="/sign-up"
      />

      <h2>How do you use chemistry notes PDFs effectively?</h2>
      <p>
        General chemistry notes PDFs from the internet are someone else's interpretation of
        the material. They won't match your professor's emphasis, exam format, or the specific
        topics being tested in your course.
      </p>
      <p>
        Use them as a supplement, not a substitute. If a concept in your own notes isn't
        clicking, finding an alternative explanation from another source helps. But your primary
        notes should come from your actual course materials — lectures, textbook chapters your
        professor assigned, and past exams from your specific class.
      </p>

      <CTABlock
        headline="Turn your chemistry material into a full study system"
        body="Upload your lecture slides or PDFs and Studymo generates organized notes, flashcards, and quizzes from your actual course content."
      />

      <FAQ items={[
        {
          question: "What should chemistry notes include?",
          answer: "For each concept: a clear definition, the relevant equation or reaction, the conditions it requires, a worked example, and any common exceptions. Keep it concise — if a concept takes more than a page, break it into sub-topics."
        },
        {
          question: "How do you take good notes in organic chemistry?",
          answer: "Prioritize mechanisms over descriptions. Draw every reaction step by step. Build a running reaction map that shows how functional groups connect. Review and redraw mechanisms the same day you learn them."
        },
        {
          question: "Should I handwrite or type chemistry notes?",
          answer: "Handwriting works better for organic chemistry because drawing mechanisms is faster by hand. For general chemistry with lots of equations, typing is fine if you have a way to input symbols. Many students do a mix: type in class, handwrite mechanism diagrams separately."
        },
        {
          question: "How do you organize notes for chemistry?",
          answer: "By concept, not by lecture date. Group related reactions and formulas together regardless of when you covered them. A concept map showing how topics connect is more useful for review than a chronological set of lecture notes."
        },
        {
          question: "Where can I find AP chemistry notes?",
          answer: "Your own notes from lectures and the textbook are the most reliable source. College Board publishes the AP Chemistry CED (Course and Exam Description) which outlines every concept that can be tested — use that to check your notes are complete."
        }
      ]} />
    </div>
  );
}
