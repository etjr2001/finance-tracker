import { describe, it, expect, beforeEach } from 'vitest'
import * as demoApi from '@features/demo/api/demoApi'

beforeEach(() => {
    window.localStorage.clear()
})

describe('demoApi categories', () => {
    it('creates, lists, updates, and deletes a category', async () => {
        const created = await demoApi.createCategory({ name: 'Hobbies' })
        expect(created).toEqual({ id: expect.any(Number), name: 'Hobbies' })

        expect(await demoApi.listCategories()).toEqual([created])

        const updated = await demoApi.updateCategory(created.id, { name: 'Hobbies & Crafts' })
        expect(updated.name).toBe('Hobbies & Crafts')

        await demoApi.deleteCategory(created.id)
        expect(await demoApi.listCategories()).toEqual([])
    })

    it('refuses to delete a category that has transactions', async () => {
        const category = await demoApi.createCategory({ name: 'Groceries' })
        await demoApi.createTransaction({
            type: 'EXPENSE',
            amount: 10,
            date: '2026-01-05',
            note: null,
            categoryId: category.id,
        })

        await expect(demoApi.deleteCategory(category.id)).rejects.toThrow(/existing transactions/)
    })

    it('renaming a category updates the denormalized name on its transactions', async () => {
        const category = await demoApi.createCategory({ name: 'Old Name' })
        const transaction = await demoApi.createTransaction({
            type: 'EXPENSE',
            amount: 10,
            date: '2026-01-05',
            note: null,
            categoryId: category.id,
        })

        await demoApi.updateCategory(category.id, { name: 'New Name' })

        const transactions = await demoApi.listTransactions()
        expect(transactions.find((t) => t.id === transaction.id).category.name).toBe('New Name')
    })
})

describe('demoApi transactions', () => {
    it('creates, lists, updates, and deletes a transaction', async () => {
        const category = await demoApi.createCategory({ name: 'Groceries' })
        const created = await demoApi.createTransaction({
            type: 'EXPENSE',
            amount: 42.5,
            date: '2026-01-05',
            note: 'Weekly shop',
            categoryId: category.id,
        })
        expect(created.category).toEqual({ id: category.id, name: 'Groceries' })

        expect(await demoApi.listTransactions()).toEqual([created])

        const updated = await demoApi.updateTransaction(created.id, {
            type: 'EXPENSE',
            amount: 50,
            date: '2026-01-06',
            note: null,
            categoryId: category.id,
        })
        expect(updated.amount).toBe(50)

        await demoApi.deleteTransaction(created.id)
        expect(await demoApi.listTransactions()).toEqual([])
    })
})

describe('demoApi dashboard', () => {
    it('sums income, expenses, and net for the given month', async () => {
        const category = await demoApi.createCategory({ name: 'Groceries' })
        await demoApi.createTransaction({ type: 'INCOME', amount: 100, date: '2026-03-01', note: null, categoryId: category.id })
        await demoApi.createTransaction({ type: 'EXPENSE', amount: 40, date: '2026-03-02', note: null, categoryId: category.id })
        // outside the requested month — must not be counted
        await demoApi.createTransaction({ type: 'EXPENSE', amount: 999, date: '2026-04-01', note: null, categoryId: category.id })

        const dashboard = await demoApi.getDashboard('2026-03')

        expect(dashboard.periodStartDate).toBe('2026-03-01')
        expect(dashboard.periodEndDate).toBe('2026-03-31')
        expect(dashboard.totalIncome).toBe(100)
        expect(dashboard.totalExpenses).toBe(40)
        expect(dashboard.net).toBe(60)
    })

    it('excludes zero-amount (Draft) transactions from the category breakdown', async () => {
        const category = await demoApi.createCategory({ name: 'Groceries' })
        await demoApi.createTransaction({ type: 'EXPENSE', amount: 0, date: '2026-03-02', note: null, categoryId: category.id })

        const dashboard = await demoApi.getDashboard('2026-03')

        expect(dashboard.byCategory).toEqual([])
    })

    it('still includes a category once it has a non-zero transaction alongside a Draft', async () => {
        const category = await demoApi.createCategory({ name: 'Groceries' })
        await demoApi.createTransaction({ type: 'EXPENSE', amount: 0, date: '2026-03-02', note: null, categoryId: category.id })
        await demoApi.createTransaction({ type: 'EXPENSE', amount: 25, date: '2026-03-03', note: null, categoryId: category.id })

        const dashboard = await demoApi.getDashboard('2026-03')

        expect(dashboard.byCategory).toEqual([{ categoryId: category.id, categoryName: 'Groceries', total: 25 }])
    })

    it('never includes INCOME in the category breakdown', async () => {
        const category = await demoApi.createCategory({ name: 'Salary' })
        await demoApi.createTransaction({ type: 'INCOME', amount: 100, date: '2026-03-01', note: null, categoryId: category.id })

        const dashboard = await demoApi.getDashboard('2026-03')

        expect(dashboard.byCategory).toEqual([])
    })
})
