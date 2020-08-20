import { EntityRepository, Repository } from 'typeorm'

import Transaction from '../models/Transaction'

interface Balance {
  income: number
  outcome: number
  total: number
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<
  Transaction
> {
  public async getBalance (): Promise<Balance> {
    const allTransactions = await this.find()

    let income = allTransactions.reduce(function (
      acumulador,
      valorAtual,
      index,
      array,
    ){
      if (valorAtual.type == 'income') {
        return acumulador + valorAtual.value
      }
      else {
        return acumulador
      }
    }, 0)
    let outcome = allTransactions.reduce(function (
      acumulador,
      valorAtual,
      index,
      array,
    ){
      if (valorAtual.type == 'outcome') {
        return acumulador + valorAtual.value
      }
      else {
        return acumulador
      }
    }, 0)

    return {
      income: income,
      outcome: outcome,
      total: income - outcome,
    }
  }
}

export default TransactionsRepository
