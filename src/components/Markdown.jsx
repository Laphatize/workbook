import React from 'react';
import ReactMarkdown from 'react-markdown';

export function Markdown({content, className = ""}) {
    return (
        <div>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
}