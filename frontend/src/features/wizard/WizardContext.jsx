import { createContext, useContext, useState } from 'react';

const WizardContext = createContext(null);

export function WizardProvider({ children }) {
  const [bookSpec, setBookSpec] = useState(null);
  const [bookUid, setBookUid] = useState(null);
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState([]);
  const [coverTemplateUid, setCoverTemplateUid] = useState(null);
  const [contentPages, setContentPages] = useState([]);

  const reset = () => {
    setBookSpec(null);
    setBookUid(null);
    setTitle('');
    setPhotos([]);
    setCoverTemplateUid(null);
    setContentPages([]);
  };

  return (
    <WizardContext.Provider
      value={{
        bookSpec, setBookSpec,
        bookUid, setBookUid,
        title, setTitle,
        photos, setPhotos,
        coverTemplateUid, setCoverTemplateUid,
        contentPages, setContentPages,
        reset,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within WizardProvider');
  return ctx;
}
