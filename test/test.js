const axios = require('axios');
const chai = require("fix-esm").require('chai');
const expect = chai.expect;

const API_BASE_URL = 'http://localhost:3000';


describe('Test Cases for ExBanking APIs', () => {


  // Test for create_user API
  it('Should create a new user successfully', async () => {
    const response = await axios.post(`${API_BASE_URL}/create_user`, {
      name: 'Test'
    });

    expect(response.status).to.equal(201);
    expect(response.data).to.have.property('message', 'User created successfully');
  });

  // Test for deposit API
  it('Should deposit money successfully', async () => {
    const response = await axios.post(`${API_BASE_URL}/deposit`, {
      userId: 1,
      amount: 1000
    });

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('message', 'Deposit successful');
  });

  // Test for withdraw API
  it('Should withdraw money successfully', async () => {
    const response = await axios.post(`${API_BASE_URL}/withdraw`, {
      userId: 1,
      amount: 10
    });

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('message', 'Withdrawal successful');
  });

  // Test for get_balance API
  it('Should GET the user balance successfully', async () => {
    const userId = '1';
    const response = await axios.get(`${API_BASE_URL}/get_balance/${userId}`);

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('balance');
  });

  // Test for send API
  it('Should send money successfully', async () => {
    const response = await axios.post(`${API_BASE_URL}/send`, {
      fromUserId: 2,
      toUserId: 3,
      amount: 100
    });

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('message', 'Money sent successfully');
  });
});
