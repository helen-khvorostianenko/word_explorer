import { Link, useParams } from "react-router";

function CategoryPage(){
  const {id} = useParams();

  return (
    <main>
      <Link to="/">Home</Link>
      <h1>Category</h1>
      <p>ID: {id}</p>
    </main>
  );
}

export default CategoryPage;