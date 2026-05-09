import { useState, useEffect } from 'react';
import { getAllCategories, postCategory, postNewCategory } from '../service/categoryService';

export const useGetCategories = (tryAgain) => {
    const [categories, setCategories] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [emptyResult, setEmptyResult] = useState(false);

    useEffect(() => {
        getAllCategories().then(response => {
            setCategories(response.data);
            setSuccess(true)
            setError(false);
            setLoading(false);

        }).catch(error => {
            const errorCode = error.response ? error.response.status : 500;

            if (errorCode === 404) {
                setEmptyResult(true);
            } else {
                setError(true);
            }

            setSuccess(false)
            setLoading(false);
        })
    }, [tryAgain]);

    return { categories, error, success, emptyResult, loading, setSuccess };
};

export const usePostCategory = () => {
    const [successOnSaveCategory, setSuccessOnSaveCategory] = useState(false);
    const [errorOnSaveCategory, setErrorOnSaveCategory] = useState(false);

    const postCategory = (category) => {
        postNewCategory(category)
            .then(response => {
                setSuccessOnSaveCategory(response.data);
                setErrorOnSaveCategory(false);
            })
            .catch(error => {
                const errorCode = error.response ? error.response.status : 500;
                setErrorOnSaveCategory(true);
            });
    };

    return { successOnSaveCategory, setSuccessOnSaveCategory, errorOnSaveCategory, postCategory };
};