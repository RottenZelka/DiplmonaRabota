// src/DataDisplay.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DataDisplay = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Fetch data from the Yii2 API
        axios.get('http://localhost:8888/api/users')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div>
            <h1>Data from Yii2 API</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Age</th>
                        <th>Aasdf</th>
                        <th>Afdasfasd</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{item.id}</td>
                            <td>{item.age}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataDisplay;
