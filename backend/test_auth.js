const axios = require('axios');

const testRegistration = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: 'test' + Date.now() + '@example.com',
            password: 'password123',
            role: 'customer'
        });
        console.log('Registration Success:', response.data);
    } catch (error) {
        console.error('Registration Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.dir(error.response.data);
        } else {
            console.error('Message:', error.message);
        }
    }
};

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'pateldeep10607@gmail.com',
            password: 'password123' // I don't know the real password, but I'll see if it hits the controller
        });
        console.log('Login Success:', response.data);
    } catch (error) {
        console.error('Login Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.dir(error.response.data);
        } else {
            console.error('Message:', error.message);
        }
    }
};

testRegistration().then(() => testLogin());
