import QuickAnswer from '@/components/blog/QuickAnswer';
import Callout from '@/components/blog/Callout';
import FeatureCard from '@/components/blog/FeatureCard';
import CTABlock from '@/components/blog/CTABlock';
import FAQ from '@/components/blog/FAQ';

export default function Post() {
  return (
    <div>
      <p>
        Everyone has been there: it's late, the exam is tomorrow, and you're staring at the
        same paragraph you've read three times without anything going in. The instinct is to
        push through. Usually that's the wrong call.
      </p>

      <QuickAnswer answer="Don't try to learn brand-new material when you're tired. Your brain won't retain it reliably. Review things you've already studied instead. Use audio-based learning so you're not fighting to keep your eyes focused on a page. If you're genuinely exhausted, a 20-minute nap will help more than forcing another hour of low-quality studying. And if you have any flexibility at all, sleep and study in the morning." />

      <h2>Is it better to study when tired or sleep and study in the morning?</h2>
      <p>
        Sleep almost always wins. Memory consolidation happens during sleep. The material you
        studied earlier in the day gets processed and stored overnight. Cutting into that to
        squeeze in more review usually costs you more than you gain.
      </p>
      <p>
        A focused hour after a full night's sleep will outperform three exhausted hours almost
        every time. If you have any flexibility in your schedule at all, protect the sleep before
        you protect the study time.
      </p>
      <p>
        The exception is when the exam is in a few hours and there's material you haven't
        touched at all. A short targeted review of the highest-priority topics is better than
        nothing in that case. But that's damage control, not a plan.
      </p>

      <h2>What can you actually study when you're tired?</h2>
      <p>
        Review familiar material instead of trying to learn something new. When you're tired,
        recognition memory holds up better than your ability to take in fresh content. Flashcards
        on things you've already seen, practice questions on topics you've already covered.
        That's a reasonable use of a tired brain. A new chapter isn't.
      </p>
      <p>
        Audio review helps a lot here. You don't have to fight to keep your eyes focused on a
        page. Studymo lets you turn your notes into a podcast-style audio lecture, so you can
        listen while lying down or moving around. Listening to familiar material when you're
        tired is actually productive. Lying in bed staring at a textbook is not.
      </p>

      <Callout type="tip">
        Listening to your own notes as audio while lying down is productive. Lying down with
        a textbook is not. Same horizontal position, very different outcomes.
      </Callout>

      <h2>How do you stay awake while studying?</h2>
      <p>
        Change your environment before anything else. Get up, move to a different room, find
        better lighting. Lying in bed with your laptop is the fastest route to falling asleep
        regardless of how urgent the material feels.
      </p>
      <p>
        Short sessions are more useful than caffeine when you're already tired. A 20-minute
        focused block followed by a 5-minute break uses your limited energy more efficiently
        than grinding through 90 minutes straight. Your brain can hold focus in short bursts
        even when it's running low.
      </p>
      <p>
        Drink water. Mild dehydration makes fatigue noticeably worse, and most people studying
        late at night aren't drinking enough. It's a genuinely easy fix.
      </p>

      <h2>How do you study smarter when you're short on time and energy?</h2>
      <p>
        Triage. When you're tired and out of time, pick the 3-5 concepts most likely to appear
        on the exam and that you feel least confident about. That's all you're working on.
      </p>
      <p>
        One practice question per concept. Check the answer. Understand the correction. That's
        the session. You'll hold more from 45 focused minutes than from three hours of drifting
        in and out.
      </p>

      <FeatureCard
        title="Podcast Mode"
        description="Turn any set of notes or uploaded lecture into an audio lesson. Review material while resting, commuting, or doing something low-effort, without needing to stare at a screen."
        href="/sign-up"
      />

      <CTABlock
        headline="Make every study session count, even the tired ones"
        body="Studymo's audio lectures let you review your notes without staring at a screen. Listen while you rest, commute, or do something low-effort."
      />

      <FAQ items={[
        {
          question: "Is it bad to study when tired?",
          answer: "It's not always bad, but it's a lot less effective for learning new material. Your brain can't take in fresh information as well when you're fatigued. Reviewing familiar material while tired is more useful than trying to learn something new."
        },
        {
          question: "Does studying before bed help you remember?",
          answer: "Light review of already-familiar material before sleep can help, because sleep consolidates what you've recently looked at. Trying to learn difficult new content right before sleeping tends not to work well."
        },
        {
          question: "Should you take a nap before studying?",
          answer: "A 20-minute nap can meaningfully improve focus for the session that follows. Keep it to 20-30 minutes. Longer naps can leave you groggier than before, which is the opposite of helpful."
        },
        {
          question: "How do you get energy to study?",
          answer: "Sleep the night before if you can. Take a short walk before sitting down. Drink water. Study somewhere well-lit. Short breaks every 25-30 minutes will sustain you longer than trying to push through in one stretch."
        },
        {
          question: "Is it better to study at night or in the morning?",
          answer: "Most people retain more from morning sessions when they're rested. Late-night studying tends to suffer from fatigue, even when it feels productive in the moment. If you have a choice, shift your sessions earlier."
        }
      ]} />
    </div>
  );
}
