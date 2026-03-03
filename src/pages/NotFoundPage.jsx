import { Link } from 'react-router';

function NotFoundPage() {
  return (
    <main>
      <h1>Not Found</h1>
      <Link to="/">Go Home</Link>
    </main>
  );
}

export default NotFoundPage;
