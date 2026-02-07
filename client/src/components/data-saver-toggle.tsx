import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

export function DataSaverToggle() {
  const [dataSaver, setDataSaver] = useState(() => {
    return localStorage.getItem('dataSaver') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('dataSaver', dataSaver.toString());
    
    // Apply data saver settings globally
    if (dataSaver) {
      document.body.classList.add('data-saver-mode');
    } else {
      document.body.classList.remove('data-saver-mode');
    }
  }, [dataSaver]);

  return (
    <button
      onClick={() => setDataSaver(!dataSaver)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        dataSaver 
          ? 'bg-green-600 text-white' 
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
      title={dataSaver ? 'وضع توفير البيانات مفعّل' : 'وضع توفير البيانات معطّل'}
    >
      {dataSaver ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">توفير البيانات</span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-sm">عادي</span>
        </>
      )}
    </button>
  );
}

export function useDataSaver() {
  const [dataSaver, setDataSaver] = useState(() => {
    return localStorage.getItem('dataSaver') === 'true';
  });

  useEffect(() => {
    const handleStorage = () => {
      setDataSaver(localStorage.getItem('dataSaver') === 'true');
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return dataSaver;
}
