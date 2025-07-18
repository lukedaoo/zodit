import '../App.css';
import { SwitchTheme } from '@components/gadget/SwitchTheme';
import Todo from '@components/todo/Todo';

const HomePage: React.FC = () => {

    return (
        <div className="min-h-screen p-8">
            <div className="flex justify-end">
                <SwitchTheme />
            </div>
            <Todo />
        </div>
    )
};

export default HomePage;
