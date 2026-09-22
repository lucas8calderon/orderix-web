import { useEffect, useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';

/**
 * react-beautiful-dnd quebra com React 18 StrictMode (droppable não registra).
 * Habilita o Droppable só depois do primeiro paint.
 */
export function StrictModeDroppable({ children, ...props }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(frame);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
}
