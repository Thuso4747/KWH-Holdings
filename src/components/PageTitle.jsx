import { useEffect } from 'react';

export default function PageTitle({ title, description }) {
  useEffect(() => {
    document.title = `${title} | KWH Holdings`;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
  }, [title, description]);
  return null;
}
