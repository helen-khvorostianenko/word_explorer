import styled from 'styled-components';

const WordTitle = styled.h1`
  font-size: 2.4rem;
  color: var(--navy);
  margin-bottom: 0.5rem;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const IPA = styled.span`
  font-size: 1rem;
  color: var(--text-muted);
  letter-spacing: 0.03em;
`;

const Audio = styled.audio`
  height: 28px;
`;

const Section = styled.section``;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: var(--navy);
  border-left: 3px solid var(--gold);
  padding-left: 0.6rem;
  margin-bottom: 1rem;
`;

const PosGroup = styled.div`
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PartOfSpeech = styled.em`
  display: inline-block;
  font-size: 0.85rem;
  color: var(--blue);
  font-style: italic;
  margin-bottom: 0.4rem;
  text-transform: capitalize;
`;

const DefinitionList = styled.ol`
  padding-left: 1.25rem;
`;

const DefinitionItem = styled.li`
  color: var(--text);
  font-size: 0.95rem;
  line-height: 1.7;
  padding: 0.2rem 0;

  & + & {
    border-top: 1px solid var(--border);
  }
`;

const EmptyText = styled.p`
  color: var(--text-muted);
  font-size: 0.95rem;
`;

function WordDefinition({ card }) {
  return (
    <>
      <WordTitle>{card.word}</WordTitle>
      <MetaRow>
        {card.ipa && <IPA>{card.ipa}</IPA>}
        {card.audioUrl && <Audio controls src={card.audioUrl} />}
      </MetaRow>
      <Section>
        <SectionTitle>Definitions</SectionTitle>
        {card.definitionsByPos.length === 0 ? (
          <EmptyText>—</EmptyText>
        ) : (
          card.definitionsByPos.map((group, idx) => (
            <PosGroup key={`${group.partOfSpeech}-${idx}`}>
              <PartOfSpeech>{group.partOfSpeech}</PartOfSpeech>
              <DefinitionList>
                {group.definitions.map((def, idx) => (
                  <DefinitionItem key={`${group.partOfSpeech}-${idx}`}>
                    {def}
                  </DefinitionItem>
                ))}
              </DefinitionList>
            </PosGroup>
          ))
        )}
      </Section>
    </>
  );
}

export default WordDefinition;
