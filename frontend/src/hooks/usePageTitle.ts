import { useEffect } from 'react';

const SITE_NAME = 'WorldInsights';

/**
 * Sets document.title to "<pageTitle> | WorldInsights".
 * Pass null / undefined to keep the default site title.
 */
const usePageTitle = (pageTitle?: string | null) => {
  useEffect(() => {
    document.title = pageTitle
      ? `${pageTitle} | ${SITE_NAME}`
      : `${SITE_NAME} — Ideas Worth Reading`;

    return () => {
      // Reset to default when component unmounts
      document.title = `${SITE_NAME} — Ideas Worth Reading`;
    };
  }, [pageTitle]);
};

export default usePageTitle;
