import MarkdownIt from 'markdown-it';
import markdownItContainer from 'markdown-it-container';

export default function asidePlugin(md: MarkdownIt) {
  // Replace <aside> and </aside> with native markdown container blocks
  // so that markdown-it can format the content inside properly.
  md.core.ruler.before('normalize', 'convert_aside', (state) => {
    // Capture the first line inside <aside> to use as the icon
    state.src = state.src
      .replace(/^<aside>[\r\n]*([^\r\n]+)[\r\n]+/gm, '::: aside $1\n')
      .replace(/^<\/aside>\s*$/gm, ':::');
  });

  // Register the container plugin
  md.use(markdownItContainer, 'aside', {
    validate: function(params: string) {
      return params.trim().match(/^aside\s*(.*)$/);
    },
    render: function (tokens: any[], idx: number) {
      const m = tokens[idx].info.trim().match(/^aside\s*(.*)$/);
      
      if (tokens[idx].nesting === 1) {
        const icon = m && m[1] ? m[1].trim() : '💡'; // default icon
        // opening tag
        return `<div class="md-aside">\n<div class="md-aside-icon">${md.utils.escapeHtml(icon)}</div>\n<div class="md-aside-content">\n`;
      } else {
        // closing tag
        return '</div>\n</div>\n';
      }
    }
  });
}
