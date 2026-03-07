function WordDefinition({ card }) {
  return (
    <>
      <h1>{card.word}</h1>
      <div>
        <strong>IPA:</strong> {card.ipa || '—'}{' '}
        {card.audioUrl ? <audio controls src={card.audioUrl} /> : null}
      </div>
      <section>
        <h2>Definitions</h2>
        {card.definitionsByPos.length === 0 ? (
          <p>—</p>
        ) : (
          <div>
            {card.definitionsByPos.map((group, idx) => (
              <div key={`${group.partOfSpeech}-${idx}`}>
                <em>{group.partOfSpeech}</em>
                <ol>
                  {group.definitions.map((def, idx) => (
                    <li key={`${group.partOfSpeech}-${idx}`}>{def}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default WordDefinition;
