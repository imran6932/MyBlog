import { useEffect, useRef } from 'react';

export const useCodeCopyButtons = (htmlContent) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current || !htmlContent) return;

    const codeBlocks = contentRef.current.querySelectorAll('pre > code, pre');
    
    codeBlocks.forEach((codeBlock) => {
      // Skip if already processed
      if (codeBlock.closest('.code-block-container')) return;

      // Get the code text
      const codeText = codeBlock.textContent || codeBlock.innerText || '';
      
      // Create container wrapper
      const container = document.createElement('div');
      container.className = 'code-block-container';
      container.style.position = 'relative';
      
      // Wrap the code block
      const parent = codeBlock.parentNode;
      parent.insertBefore(container, codeBlock);
      container.appendChild(codeBlock);
      
      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'code-copy-button';
      copyButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5,15H4a2,2 0 0,1-2-2V4a2,2 0 0,1,2-2H15a2,2 0 0,1,2,2V5"/>
        </svg>
        Copy
      `;
      copyButton.title = 'Copy code to clipboard';
      copyButton.setAttribute('aria-label', 'Copy code to clipboard');
      
      // Add copy functionality
      copyButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeText);
          
          // Show success state
          copyButton.classList.add('copied');
          copyButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            Copied!
          `;
          
          // Reset after 2 seconds
          setTimeout(() => {
            copyButton.classList.remove('copied');
            copyButton.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5,15H4a2,2 0 0,1-2-2V4a2,2 0 0,1,2-2H15a2,2 0 0,1,2,2V5"/>
              </svg>
              Copy
            `;
          }, 2000);
          
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = codeText;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            document.execCommand('copy');
            
            // Show success state
            copyButton.classList.add('copied');
            copyButton.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Copied!
            `;
            
            // Reset after 2 seconds
            setTimeout(() => {
              copyButton.classList.remove('copied');
              copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5,15H4a2,2 0 0,1-2-2V4a2,2 0 0,1,2-2H15a2,2 0 0,1,2,2V5"/>
                </svg>
                Copy
              `;
            }, 2000);
            
          } catch (fallbackErr) {
            console.error('Failed to copy code:', fallbackErr);
          }
          
          document.body.removeChild(textArea);
        }
      });
      
      // Add button to container
      container.appendChild(copyButton);
    });

    // Cleanup function
    return () => {
      if (contentRef.current) {
        const containers = contentRef.current.querySelectorAll('.code-block-container');
        containers.forEach(container => {
          const buttons = container.querySelectorAll('.code-copy-button');
          buttons.forEach(button => {
            button.removeEventListener('click', () => {});
          });
        });
      }
    };
  }, [htmlContent]);

  return contentRef;
};
