import { Link } from 'react-router';
import PageLayout from '../shared/PageLayout';

function NotFoundPage() {
  return (
    <PageLayout>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Go Home</Link>
    </PageLayout>
  );
}

export default NotFoundPage;
