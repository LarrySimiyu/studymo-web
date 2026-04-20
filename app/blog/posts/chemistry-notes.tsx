import QuickAnswer from '@/components/blog/QuickAnswer';
import Callout from '@/components/blog/Callout';
import FeatureCard from '@/components/blog/FeatureCard';
import CTABlock from '@/components/blog/CTABlock';
import FAQ from '@/components/blog/FAQ';

export default function Post() {
  return (
    <div>
      <p>
        Chemistry is one of those subjects where the difference between good notes and bad ones
        shows up immediately at test time. Bad chemistry notes are basically lecture transcripts:
        too long, no structure, impossible to review quickly. Good ones are built around what you
        actually need to solve problems.
      </p>

      <QuickAnswer answer="Organize chemistry notes by concept, not by lecture date. For each concept, capture: the definition, the key equation or reaction, a worked example, and any exceptions. Use consistent shorthand. Aim for one page per major topic. If it's longer, you're probably capturing too much. Review within 24 hours of the lecture while details are still fresh." />

      <h2>How should you take notes in chemistry class?</h2>
      <p>
        Don't try to write everything down. Chemistry lectures move fast, and if you're copying
        every word you're not actually following the logic. The concepts you don't understand
        while the professor is talking are still going to be the ones you don't understand when
        you try to review.
      </p>
      <p>
        Focus on three things: what the concept is, the equation or mechanism behind it, and any
        worked example the professor walks through. Those examples are worth more than the
        definition. They show you how to apply it, which is what the exam will actually ask you
        to do.
      </p>
      <p>
        The rewrite after class is where the real work happens. While the lecture is still fresh,
        reorganize your notes. Force yourself to reconstruct the logic instead of just copying it.
        Students who skip this step tend to get to exam week and realize they understood the
        material less than they thought.
      </p>

      <h2>What's the best format for chemistry notes?</h2>
      <p>
        Structure beats prose for chemistry. For each concept: the name, the equation or
        mechanism, the conditions it requires, and a worked example. That format makes review
        fast. You can scan for what you need instead of reading through paragraphs to find it.
      </p>
      <p>
        For organic chemistry specifically, draw the mechanisms rather than trying to describe
        them in words. A sentence explaining electron movement is almost always less useful than
        an arrow-pushing diagram. Label the arrows. Write the conditions next to each step.
      </p>

      <Callout type="note">
        Color coding helps in chemistry when used with restraint. One color for reactions,
        another for conditions, another for exceptions. More than three colors and the system
        starts working against you.
      </Callout>

      <h2>How do you take AP chemistry notes?</h2>
      <p>
        The biggest AP chemistry note-taking mistake is keeping everything organized by lecture
        date. By week six, you have no idea where you wrote anything, and review turns into a
        treasure hunt.
      </p>
      <p>
        Keep a section per unit: electrochemistry, kinetics, equilibrium. Within each unit, use
        the structured format: what it is, the key formula, the conditions it requires, one worked
        problem. AP free response questions ask you to explain your reasoning, so your notes
        should capture the why behind each concept, not just the formula.
      </p>

      <h2>What about organic chemistry notes?</h2>
      <p>
        Orgo is different from general chemistry. There are a lot of reaction types and they all
        look similar until you understand what connects them. Notes that are just lists of
        reactions won't get you there.
      </p>
      <p>
        Build a reaction map as you go through the course, a visual that shows how functional
        groups connect through different reaction types. Most students who struggle with orgo
        aren't struggling because they're bad at chemistry. They're missing the big-picture view
        of how everything relates to each other.
      </p>

      <FeatureCard
        title="AI Note Generation from Lecture Files"
        description="Upload your chemistry lecture slides or PDFs and Studymo generates organized notes structured by concept: key equations, definitions, and worked examples pulled out and formatted for review."
        href="/sign-up"
      />

      <h2>How do you use chemistry notes PDFs effectively?</h2>
      <p>
        Notes PDFs from the internet are someone else's interpretation of the material. They
        might be accurate, but they won't reflect what your professor emphasized, what's on your
        specific exam, or how your course frames the concepts.
      </p>
      <p>
        Use them when something in your own notes isn't clicking. Finding another explanation
        for a confusing concept is legitimate. But your primary notes should come from your
        actual lectures and textbook chapters, not from a PDF written for a different professor's
        course.
      </p>

      <CTABlock
        headline="Turn your chemistry material into a full study system"
        body="Upload your lecture slides or PDFs and Studymo generates organized notes, flashcards, and quizzes from your actual course content."
      />

      <FAQ items={[
        {
          question: "What should chemistry notes include?",
          answer: "For each concept: a clear definition, the relevant equation or reaction, the conditions it requires, a worked example, and any common exceptions. Keep it tight. If a concept takes more than a page, break it into sub-topics."
        },
        {
          question: "How do you take good notes in organic chemistry?",
          answer: "Prioritize mechanisms over descriptions. Draw every reaction step by step rather than writing it out. Build a running reaction map that shows how functional groups connect. Review and redraw mechanisms the same day you learn them, not a week later."
        },
        {
          question: "Should I handwrite or type chemistry notes?",
          answer: "Handwriting works better for orgo because drawing mechanisms by hand is faster than typing them. For general chemistry with lots of equations, typing is fine if you can input symbols. A lot of students do both: type during class, draw mechanism diagrams by hand separately."
        },
        {
          question: "How do you organize notes for chemistry?",
          answer: "By concept, not by lecture date. Group related reactions and formulas together regardless of when you covered them. A concept map showing how topics connect is far more useful for review than a chronological stack of lecture notes."
        },
        {
          question: "Where can I find AP chemistry notes?",
          answer: "Your own notes from lecture and the textbook are the most reliable source. College Board publishes the AP Chemistry CED, which outlines every concept that can be tested. Use that to check your notes are complete, not as a replacement for them."
        }
      ]} />
    </div>
  );
}
