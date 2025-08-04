import React from 'react';
import '../App.css';
import { MantineProvider } from '@mantine/core';
import { TodoV1 } from '@components/todo';

const TodoApp: React.FC = () => {
    return (
        <>
            <MantineProvider>
                <TodoV1 />
            </MantineProvider>
        </>
    )
};

export default TodoApp;
