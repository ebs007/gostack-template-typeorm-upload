import { Router } from 'express'
import { getCustomRepository } from 'typeorm'
import TransactionsRepository from '../repositories/TransactionsRepository'
import CreateTransactionService from '../services/CreateTransactionService'
import DeleteTransactionService from '../services/DeleteTransactionService'
import ImportTransactionsService from '../services/ImportTransactionsService'
import multer from 'multer'
import uploadConfig from '../config/upload'

const transactionsRouter = Router()

const upload = multer(uploadConfig)

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(
    TransactionsRepository,
  )
  const transactions = await transactionsRepository.find()
  const getBalance = await transactionsRepository.getBalance()
  // console.log(getBalance)

  return response.json({
    transactions,
    balance: getBalance,
  })
})

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body

  const createTransaction = new CreateTransactionService()

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  })

  return response.json(transaction)
})

transactionsRouter.delete(
  '/:id',
  async (request, response) => {
    const { id } = request.params

    const transactionDelete = new DeleteTransactionService()

    await transactionDelete.execute({
      id,
    })

    return response.status(204).send()
  },
)

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { filename } = request.file
    // console.log(filename)

    const importTransaction = new ImportTransactionsService()

    const transactions = await importTransaction.execute(
      filename,
    )

    return response.json(transactions)
  },
)

export default transactionsRouter
