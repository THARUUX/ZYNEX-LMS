import { useRouter } from 'next/router';
import { useState } from 'react';
import Loading from '../../../../components/Loading';

const BackButton = () => {
  const router = useRouter();
  const [ isLoading , setLoading ] = useState(false);

  const handleBack = () => {
    router.back(); // This takes the user back to the previous page
    setLoading(true);
  };

  if(isLoading) return <Loading />

  return (
    <button onClick={handleBack} className="bg-slate-900 hover:bg-slate-600 cursor-pointer text-white px-3 py-2 duration-300 hover:scale-105 rounded">
      Back
    </button>
  );
};

export default BackButton;
