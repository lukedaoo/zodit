import React from 'react';
import '../App.css';
import Todo from '@components/todo/Todo';

const HomePage: React.FC = () => {
    return (
        <>
            <h1>Home Page</h1>
            <Todo />
        </>
    )
};

export default HomePage;
