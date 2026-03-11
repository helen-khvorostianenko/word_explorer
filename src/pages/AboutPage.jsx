import styled from 'styled-components';
import PageLayout from '../shared/PageLayout.jsx';

const PageTitle = styled.h1`
  font-size: 2rem;
  color: var(--navy);
  margin-bottom: 1.5rem;
`;

const Article = styled.article`
  max-width: 680px;
`;

const Intro = styled.p`
  color: var(--text);
  line-height: 1.8;
  margin-bottom: 2rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: var(--navy);
  border-left: 3px solid var(--gold);
  padding-left: 0.6rem;
  margin-bottom: 0.75rem;
`;

const SectionText = styled.p`
  color: var(--text);
  line-height: 1.8;

  a {
    color: var(--blue);
    transition: color 0.2s;

    &:hover {
      color: var(--gold);
    }
  }
`;

function AboutPage() {
  return (
    <PageLayout>
      <Article>
        <PageTitle>About Word Explorer</PageTitle>
        <Intro>
          Every great communicator started somewhere. Word Explorer was built
          for those moments when one word isn't enough — when you want to
          understand not just what a word means, but how it sounds, what it
          rhymes with, and how it connects to everything else you know. Whether
          you're a developer sharpening your technical English, a professional
          polishing your writing, or simply someone who loves language — this is
          your space to grow.
        </Intro>

        <Section>
          <SectionTitle>How it works</SectionTitle>
          <SectionText>
            Search any English word and instantly get its definition, IPA
            transcription, audio pronunciation, and related words — synonyms,
            rhymes, and more. Save words to your personal lists, add notes, and
            come back to review them whenever you're ready.
          </SectionText>
        </Section>

        <Section>
          <SectionTitle>Optimised search</SectionTitle>
          <SectionText>
            The search autocomplete is built for speed and efficiency. Results
            are cached so repeated queries never hit the network twice. Requests
            are debounced to avoid unnecessary API calls while you type, and
            each search is cancellable — if you type faster than the network
            responds, outdated results are automatically discarded. You get
            exactly what you need, exactly when you need it.
          </SectionText>
        </Section>

        <Section>
          <SectionTitle>Built at Code the Dream</SectionTitle>
          <SectionText>
            This project was created as part of the curriculum at{' '}
            <a href="https://codethedream.org" target="_blank" rel="noreferrer">
              Code the Dream
            </a>{' '}
            — a nonprofit organisation that teaches web development skills to
            people from underrepresented communities. Word Explorer is designed
            not just as a learning exercise, but as a tool for daily use by
            anyone on a journey to master the English language.
          </SectionText>
        </Section>
      </Article>
    </PageLayout>
  );
}

export default AboutPage;
