import { Router } from 'express';
import { uuid } from 'uuidv4';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';

const transactionRouter = Router();

const transactionsRepository = new TransactionsRepository();

transactionRouter.get('/', (request, response) => {
  try {
    return response.json({
      transactions: transactionsRepository.all(),
      balance: transactionsRepository.getBalance(),
    });
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

transactionRouter.post('/', (request, response) => {
  try {
    const { title, value, type } = request.body;

    const newTransaction = { id: uuid(), title, value, type };
    const createService = new CreateTransactionService(transactionsRepository);
    createService.execute({ title, value, type });

    return response.json(newTransaction);
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

export default transactionRouter;
