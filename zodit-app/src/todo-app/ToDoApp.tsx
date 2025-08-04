import React from 'react';
import '../App.css';
import { MantineProvider } from '@mantine/core';
import Todo from '@components/todo/draggable/TodoV2';

const TodoApp: React.FC = () => {
    return (
        <>
            <MantineProvider>
                <Todo />
            </MantineProvider>
        </>
    )
};

export default TodoApp;
