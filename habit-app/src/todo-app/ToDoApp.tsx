import React from 'react';
import '../App.css';
import Todo from '@components/todo/Todo';

const TodoApp: React.FC = () => {
    return (
        <>
            <h1>Todo App</h1>
            <Todo />
        </>
    )
};

export default TodoApp;
