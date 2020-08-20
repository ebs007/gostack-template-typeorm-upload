import { getCustomRepository, getRepository } from 'typeorm'
import Transaction from '../models/Transaction'
import AppError from '../errors/AppError'
import csvParse from 'csv-parse'
import fs from 'fs'
import path from 'path'
import TransactionsRepository from '../repositories/TransactionsRepository'
import Category from '../models/Category'

interface CsvFile {
  filePath: string
  csvFilePath: string
}
class ImportTransactionsService {
  async loadCSV (filePath: string): Promise<any[]> {
    const readCSVStream = fs.createReadStream(filePath)

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    })

    const parseCSV = readCSVStream.pipe(parseStream)

    const lines: any = []

    parseCSV.on('data', (line) => {
      lines.push(line)
    })

    await new Promise((resolve) => {
      parseCSV.on('end', resolve)
    })

    return lines
  }

  async execute (filePath: string): Promise<Transaction[]> {
    const csvFilePath = path.resolve(
      __dirname,
      '..',
      '..',
      'tmp',
      filePath,
    )

    if (!csvFilePath) {
      throw new AppError('File not found.', 400)
    }

    const data = await this.loadCSV(csvFilePath)

    // console.log(data)

    if (!data) {
      throw new AppError('Data not found.', 400)
    }

    let newDataTransaction: any = []

    const categoriesRepository = getRepository(Category)

    for (const element of data) {
      // data.map(async (element, index) => {
      const categoryFound = await categoriesRepository.findOne(
        {
          where: { title: element[3] },
        },
      )

      const transactionsRepository = getCustomRepository(
        TransactionsRepository,
      )

      if (!categoryFound) {
        const transaction = await transactionsRepository.save(
          {
            title: element[0],
            type: element[1],
            value: element[2],
            category: { title: element[3] },
          },
        )

        if (!transaction) {
          throw new AppError('Not Recorded.', 400)
        }

        newDataTransaction.push(transaction)
      }
      else {
        const transaction = await transactionsRepository.save(
          {
            title: element[0],
            type: element[1],
            value: element[2],
            category:
              {
                id: categoryFound.id,
                title: categoryFound.title,
              },
          },
        )

        if (!transaction) {
          throw new AppError('Not Recorded.', 400)
        }

        newDataTransaction.push(transaction)
      }
    }

    // })

    // console.log('ndt: ', await newDataTransaction)

    // const transaction = transactionsRepository.create({
    //   title,
    //   value,
    //   type,
    //   category: { title: category },
    // })

    return newDataTransaction
  }
}

export default ImportTransactionsService
