import fs from 'fs';
import csvParse from 'csv-parse';
import { getRepository, In, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    // get data from file
    const readStream = fs.createReadStream(filePath);
    const parser = csvParse({ from_line: 2 });
    const parseCsv = readStream.pipe(parser);
    const transactions: CSVTransaction[] = [];
    const categoriesSet = new Set();
    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categoriesSet.add(category);
      transactions.push({ title, type, value, category });
    });
    await new Promise(resolve => parseCsv.on('end', resolve));

    // categories creation
    const categoryRepository = getRepository(Category);
    const categories = Array.from(categoriesSet) as string[];
    const existentCategories = await categoryRepository.find({
      where: { title: In(categories) },
    });
    const existentCategoriesTitles = existentCategories.map(
      category => category.title,
    );
    const categoriesToAdd = categories.filter(
      category => !existentCategoriesTitles.includes(category),
    );
    const newCategories = categoryRepository.create(
      categoriesToAdd.map(category => ({ title: category })),
    );
    await categoryRepository.save(newCategories);
    const finalCategories = [...newCategories, ...existentCategories];

    // transactions creation
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    await transactionsRepository.save(createdTransactions);

    // file deletion
    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
