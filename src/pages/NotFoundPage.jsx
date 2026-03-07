import { Link } from 'react-router';

function NotFoundPage() {
  return (
    <main>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Go Home</Link>
    </main>
  );
}

export default NotFoundPage;
