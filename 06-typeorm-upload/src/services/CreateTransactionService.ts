import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    // check balance before anything (value of outcome cannot be higher than actual balance)
    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();
      if (value > total) {
        throw new AppError('You do not have enough balance!');
      }
    }

    // get or create category
    const categoryRepository = getRepository(Category);
    let transactionCategory = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({ title: category });
    }
    await categoryRepository.save(transactionCategory);

    // create transaction (with category)
    const newTransaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });
    await transactionsRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
