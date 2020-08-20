import { getCustomRepository, getRepository } from 'typeorm'
import AppError from '../errors/AppError'
import TransactionsRepository from '../repositories/TransactionsRepository'
import Transaction from '../models/Transaction'
import Category from '../models/Category'

interface Request {
  title: string
  value: number
  type: 'income' | 'outcome'
  category: string
}

class CreateTransactionService {
  public async execute ({
    title,
    value,
    type,
    category,
  }: Request): Promise<any> {
    const transactionsRepository = getCustomRepository(
      TransactionsRepository,
    )

    const totalTransactions = await transactionsRepository.getBalance()

    if (
      type == 'outcome' &&
      value > totalTransactions.total
    ) {
      throw new AppError(
        'Operação não permitida. Valor de saíde ultrapassa o saldo em caixa.',
        400,
      )
    }

    const categoriesRepository = getRepository(Category)

    const categoryFound = await categoriesRepository.findOne(
      {
        where: { title: category },
      },
    )

    let transaction = null

    if (!categoryFound) {
      transaction = transactionsRepository.create({
        title,
        value,
        type,
        category: { title: category },
      })
    }
    else {
      transaction = transactionsRepository.create({
        title,
        value,
        type,
        category:
          {
            id: categoryFound.id,
            title: categoryFound.title,
          },
      })
    }

    await transactionsRepository.save(transaction)

    return transaction
  }
}

export default CreateTransactionService
