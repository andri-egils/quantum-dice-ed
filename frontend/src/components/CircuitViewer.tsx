import React from 'react';

export default function CircuitViewer({ svg }: { svg: string }) {
  return (
    <div
      style={{ border: '1px solid #ddd', padding: 8, overflow: 'auto' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
