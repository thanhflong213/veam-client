'use client';

import { useEffect, useState } from 'react';

let showToastFn: ((msg: string) => void) | null = null;

export function showToast(message: string) {
  showToastFn?.(message);
}

export default function Toast() {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    showToastFn = (m: string) => {
      setMsg(m);
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    };
    return () => { showToastFn = null; };
  }, []);

  return (
    <div id="toast" className={visible ? 'show' : ''}>
      {msg}
    </div>
  );
}
