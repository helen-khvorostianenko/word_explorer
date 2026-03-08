import PageLayout from '../shared/PageLayout.jsx';

function AboutPage() {
  return (
    <PageLayout>
      <h1>About Word Explorer</h1>
      <p>
        Every great communicator started somewhere. Word Explorer was built for
        those moments when one word isn't enough — when you want to understand
        not just what a word means, but how it sounds, what it rhymes with, and
        how it connects to everything else you know. Whether you're a developer
        sharpening your technical English, a professional polishing your
        writing, or simply someone who loves language — this is your space to
        grow.
      </p>
      <section>
        <h2>How it works</h2>
        <p>
          Search any English word and instantly get its definition, IPA
          transcription, audio pronunciation, and related words — synonyms,
          rhymes, and more. Save words to your personal lists, add notes, and
          come back to review them whenever you're ready.
        </p>
      </section>
      <section>
        <h2>Optimised search</h2>
        <p>
          The search autocomplete is built for speed and efficiency. Results are
          cached so repeated queries never hit the network twice. Requests are
          debounced to avoid unnecessary API calls while you type, and each
          search is cancellable — if you type faster than the network responds,
          outdated results are automatically discarded. You get exactly what you
          need, exactly when you need it.
        </p>
      </section>
      <section>
        <h2>Built at Code the Dream</h2>
        <p>
          This project was created as part of the curriculum at{' '}
          <a href="https://codethedream.org" target="_blank" rel="noreferrer">
            Code the Dream
          </a>
          — a nonprofit organisation that teaches web development skills to
          people from underrepresented communities. Word Explorer is designed
          not just as a learning exercise, but as a tool for daily use by anyone
          on a journey to master the English language.
        </p>
      </section>
    </PageLayout>
  );
}

export default AboutPage;
