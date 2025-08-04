import { useEffect } from 'react';

/**
 * Custom hook to set the document title
 * @param title The title to set for the document
 * @param prevailOnUnmount Whether to keep this title when component unmounts
 */
export const useDocumentTitle = (
  title: string,
  prevailOnUnmount: boolean = false
) => {
  const defaultTitle = "Quorum - Connect & Collaborate";
  
  useEffect(() => {
    // Set the favicon dynamically
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      // Force favicon refresh by adding timestamp
      link.href = "/quorum-logo.png?v=" + new Date().getTime();
    }
    
    // Set document title
    document.title = title || defaultTitle;
    
    return () => {
      if (!prevailOnUnmount) {
        document.title = defaultTitle;
      }
    };
  }, [title, prevailOnUnmount, defaultTitle]);
};

export default useDocumentTitle;
