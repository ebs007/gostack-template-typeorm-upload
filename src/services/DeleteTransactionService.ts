import { getCustomRepository } from 'typeorm'
import AppError from '../errors/AppError'
import TransactionsRepository from '../repositories/TransactionsRepository'

interface Request {
  id: string
}

class DeleteTransactionService {
  public async execute ({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(
      TransactionsRepository,
    )

    const transactionDelete = await transactionsRepository.delete(
      id,
    )

    if (!transactionDelete) {
      throw new AppError('Transaction not found.', 400)
    }

    // return transactionDelete
  }
}

export default DeleteTransactionService
