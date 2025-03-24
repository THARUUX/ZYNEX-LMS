import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Loading from '../../../../components/Loading';
import { toast } from 'react-toastify';
import Tasks from '../components/Tasks';

export default function Class() {
    const router = useRouter();
    const { id } = router.query;
    const [isLoading, setLoading] = useState(true);
    const [classType, setClassType] = useState(null);

    useEffect(() => {
        if (id) {
            fetchClassType();
        }
    }, [id]);

    const fetchClassType = async () => {
        try {
            const res = await fetch(`/api/classTypes/${id}`);
            if (!res.ok) throw new Error("Error fetching class type.");
            const data = await res.json();
            setClassType(data);
        } catch (error) {
            toast.error(error.message, { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };


    if (isLoading) return <Loading />;

    return (
        <Layout>
            <div className="p-5">
                <div className="w-full tracking-wider sm:px-5 py-3 text-lg sm:text-3xl text-slate-900 flex justify-between">
                    <div>Class: {classType ? classType.name : 'Not Found'}</div>
                </div>
                <div className='p-5 flex flex-col sm:max-w-1/3 max-h-[100vh] sm:max-h-[50vh]'>
                    <Tasks id={id}/>
                </div>
            </div>
        </Layout>
    );
}
