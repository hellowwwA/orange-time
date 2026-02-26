import React, { useEffect, useState } from 'react';
import { MdCatalog, MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/preview.css';

interface MarkdownWithTocProps {
  content: string;
  editorId: string;
  minHeightClassName?: string;
}

const MarkdownWithToc: React.FC<MarkdownWithTocProps> = ({
  content,
  editorId,
  minHeightClassName = 'min-h-[500px]',
}) => {
  const [headings, setHeadings] = useState<{ id: string; level: number; active: boolean }[]>([]);

  useEffect(() => {
    if (!content) {
      setHeadings([]);
      return;
    }

    const timer = setTimeout(() => {
      const previewElement = document.getElementById(editorId);
      if (!previewElement) return;
      const headingElements = previewElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
      setHeadings(
        Array.from(headingElements).map((el) => ({
          id: el.id,
          level: parseInt(el.tagName.substring(1), 10),
          active: false,
        }))
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [content, editorId]);

  useEffect(() => {
    if (!headings.length) return;

    const container = document.querySelector('main') as HTMLElement | null;

    const handleScroll = () => {
      const topOffset = 100;
      let activeId = '';

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        if (rect.top <= topOffset + 50) {
          activeId = heading.id;
        } else {
          break;
        }
      }

      setHeadings((prev) => {
        const isSame = prev.every((h) => h.active === (h.id === activeId));
        if (isSame) return prev;
        return prev.map((h) => ({ ...h, active: h.id === activeId }));
      });
    };

    const target: HTMLElement | Window = container || window;
    target.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => target.removeEventListener('scroll', handleScroll);
  }, [headings.map((h) => h.id).join(',')]);

  return (
    <div className={`flex relative items-start h-full ${minHeightClassName}`}>
      <div className="flex-1 overflow-hidden min-w-0 transition-all duration-300 pr-12">
        <MdPreview
          editorId={editorId}
          modelValue={content}
          previewTheme="github"
          style={{ minHeight: '300px', padding: '16px', fontSize: '14px' }}
        />
        <style>{`
          #${editorId} h1,
          #${editorId} h2,
          #${editorId} h3,
          #${editorId} h4,
          #${editorId} h5,
          #${editorId} h6 {
            scroll-margin-top: 120px !important;
            transition: background-color 0.3s ease;
          }

          h1[id], h2[id], h3[id], h4[id], h5[id], h6[id] {
            scroll-margin-top: 120px !important;
          }

          main {
            scroll-padding-top: 120px;
          }

          @keyframes heading-highlight {
            0% { background-color: rgba(147, 197, 253, 0.4); }
            50% { background-color: rgba(147, 197, 253, 0.6); }
            100% { background-color: transparent; }
          }

          .heading-highlight-active {
            animation: heading-highlight 1.5s ease-out;
            border-radius: 4px;
          }

          #${editorId} p code,
          #${editorId} li code,
          #${editorId} td code,
          #${editorId} h1 code,
          #${editorId} h2 code,
          #${editorId} h3 code,
          #${editorId} h4 code,
          #${editorId} h5 code,
          #${editorId} h6 code,
          #${editorId} blockquote code {
            color: #ef4444 !important;
            background-color: #f1f5f9 !important;
            padding: 0.15em 0.4em !important;
            border-radius: 4px !important;
            font-size: 0.9em !important;
          }

          /* Restore list styles overridden by Tailwind preflight */
          #${editorId} ul {
            list-style-type: disc !important;
            padding-left: 2rem !important;
            margin-bottom: 1em !important;
          }
          #${editorId} ul ul {
            list-style-type: circle !important;
          }
          #${editorId} ul ul ul {
            list-style-type: square !important;
          }
          #${editorId} ol {
            list-style-type: decimal !important;
            padding-left: 2rem !important;
            margin-bottom: 1em !important;
          }
          #${editorId} li {
            margin-bottom: 0.25em !important;
            display: list-item !important;
          }
        `}</style>
      </div>

      <div className="absolute -right-6 top-0 h-full w-12 z-[20001] pointer-events-none">
        <div className="sticky top-24 pointer-events-auto group w-12 hover:w-64 transition-all duration-300 min-h-[300px] flex justify-end">
          <div className="absolute top-2 right-0 w-12 flex flex-col items-end pr-3 gap-3 opacity-100 group-hover:opacity-0 transition-opacity duration-200 delay-75 pointer-events-none">
            {headings.map((heading, index) => {
              let widthClass = 'w-4';
              if (heading.level === 1) widthClass = 'w-6';
              if (heading.level === 2) widthClass = 'w-5';
              if (heading.level >= 3) widthClass = 'w-4';

              return (
                <div
                  key={heading.id + index}
                  className={`${widthClass} h-1 rounded-full transition-colors duration-300 ${heading.active ? 'bg-slate-600' : 'bg-slate-200'}`}
                />
              );
            })}
            {headings.length === 0 && (
              <>
                <div className="w-6 h-1 bg-slate-200 rounded-full" />
                <div className="w-4 h-1 bg-slate-200 rounded-full" />
                <div className="w-5 h-1 bg-slate-200 rounded-full" />
              </>
            )}
          </div>

          <div className="absolute top-0 right-full mr-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right z-[20000]">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200">
              Contents
            </div>
            <MdCatalog
              editorId={editorId}
              scrollElement="main"
              scrollElementOffsetTop={120}
              theme="light"
              onClick={(e, tocItem) => {
                const previewRoot = document.getElementById(editorId);
                const targetElement = previewRoot?.querySelectorAll('h1, h2, h3, h4, h5, h6')[tocItem.index - 1] as HTMLElement | undefined;
                if (!targetElement) return;

                const rect = targetElement.getBoundingClientRect();
                const headerHeight = 65;
                const clearance = 55;
                const minTop = headerHeight + clearance;
                const isFullyVisible = rect.top >= minTop && rect.bottom <= window.innerHeight;

                if (isFullyVisible) {
                  e.preventDefault();
                }

                targetElement.classList.remove('heading-highlight-active');
                void targetElement.offsetWidth;
                targetElement.classList.add('heading-highlight-active');
                setTimeout(() => {
                  targetElement.classList.remove('heading-highlight-active');
                }, 1500);
              }}
              className="text-sm text-slate-600 [&_.md-editor-catalog-link]:block [&_.md-editor-catalog-link]:py-1 [&_.md-editor-catalog-link]:px-2 [&_.md-editor-catalog-link]:rounded-md [&_.md-editor-catalog-link]:truncate [&_.md-editor-catalog-link:hover]:bg-slate-200/50 [&_.md-editor-catalog-link-active]:text-primary [&_.md-editor-catalog-link-active]:bg-orange-50 [&_.md-editor-catalog-link-active]:font-semibold cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownWithToc;
