import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../../styles/markdown-styles.css';

export function MarkdownViewer({content, className = ""}) {
    return (
        <div>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
}