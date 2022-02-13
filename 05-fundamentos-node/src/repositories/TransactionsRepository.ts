import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getBalance(): Balance {
    function reducer(type_: 'income' | 'outcome') {
      return (acc: number, { value, type }: TransactionDTO): number => {
        return acc + (type === type_ ? value : 0);
      };
    }

    const income = this.transactions.reduce(reducer('income'), 0);
    const outcome = this.transactions.reduce(reducer('outcome'), 0);

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }

  public create({ title, value, type }: TransactionDTO): Transaction {
    const newTransaction = new Transaction({ title, value, type });
    this.transactions.push(newTransaction);
    return newTransaction;
  }
}

export default TransactionsRepository;
