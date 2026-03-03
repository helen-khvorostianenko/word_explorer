import { useParams, Link} from "react-router";
function WordPage() {
   const { word } = useParams();
   console.log(word);
  return (
    <main>
      <h1>Word Page</h1>
      <p>Word: {word}</p>
      <Link to="/">Back to Home</Link>
    </main>
  );
}

export default WordPage