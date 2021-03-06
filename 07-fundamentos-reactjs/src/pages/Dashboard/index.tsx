import React, { useState, useEffect } from 'react';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';
import Header from '../../components/Header';
import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  created_at: string;
  category: {
    title: string;
  };
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

interface TransactionFromBackend {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
  created_at: string;
  category: {
    title: string;
  };
}

interface BalanceFromBackend {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionsResponse {
  transactions: TransactionFromBackend[];
  balance: BalanceFromBackend;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    api
      .get<TransactionsResponse>('transactions')
      .then(response => {
        const formattedTransactions = response.data.transactions.map(transaction => ({
          ...transaction,
          formattedValue:
            (transaction.type === 'outcome' ? '- ' : '') + formatValue(transaction.value),
          formattedDate: new Date(transaction.created_at).toLocaleDateString('pt-br'),
        }));
        const formattedBalance = {
          income: formatValue(response.data.balance.income),
          outcome: formatValue(response.data.balance.outcome),
          total: formatValue(response.data.balance.total),
        };
        setTransactions(formattedTransactions);
        setBalance(formattedBalance);
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Sa??das</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>T??tulo</th>
                <th>Pre??o</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="title">{transaction.title}</td>
                  <td className={transaction.type}>{transaction.formattedValue}</td>
                  <td>{transaction.category.title}</td>
                  <td>{transaction.formattedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
