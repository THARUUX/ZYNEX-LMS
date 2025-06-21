import { createContext, useContext, useState } from "react";

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmDialogProvider = ({ children }) => {
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [resolveCallback, setResolveCallback] = useState(null);

  const ask = (text) => {
    setQuestion(text);
    setOpen(true);
    return new Promise((resolve) => {
      setResolveCallback(() => resolve);
    });
  };

  const handleConfirm = () => {
    setOpen(false);
    if (resolveCallback) resolveCallback(true);
  };

  const handleCancel = () => {
    setOpen(false);
    if (resolveCallback) resolveCallback(false);
  };

  return (
    <ConfirmContext.Provider value={{ ask }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-xl max-w-sm w-full text-center">
            <p className="mb-4 text-lg font-semibold">{question}</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleConfirm} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Yes
              </button>
              <button onClick={handleCancel} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
