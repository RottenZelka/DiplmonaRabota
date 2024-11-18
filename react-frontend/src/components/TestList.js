import React, { useEffect, useState } from 'react';
import { getUsers } from '../api/api';

const TestList = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getUsers();
            
            setUsers(data);
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1>Test List</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default TestList;
