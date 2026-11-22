import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import GlossaryModal from '../components/GlossaryModal';

const GlossaryContext = createContext({ openGlossary: () => {} });

export function GlossaryProvider({ children }) {
  const [state, setState] = useState({ open: false, termId: null });

  const openGlossary = useCallback((termId = null) => setState({ open: true, termId }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  const value = useMemo(() => ({ openGlossary }), [openGlossary]);

  return (
    <GlossaryContext.Provider value={value}>
      {children}
      <GlossaryModal isOpen={state.open} onClose={close} initialTermId={state.termId} />
    </GlossaryContext.Provider>
  );
}

export function useGlossary() {
  return useContext(GlossaryContext);
}
