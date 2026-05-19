'use client'

import { useState, useMemo } from 'react'
import { calculateBalances } from '@/lib/mock-data'
import { Expense, Traveler } from '@/lib/types'
import { useTrip } from '@/lib/trip-context'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  Receipt,
  Bed,
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
  HelpCircle,
  Check,
  Sparkles,
  Wallet
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const categoryIcons: Record<Expense['category'], typeof Bed> = {
  lodging: Bed,
  food: Utensils,
  transport: Car,
  activities: Ticket,
  shopping: ShoppingBag,
  other: HelpCircle,
}

const categoryLabels: Record<Expense['category'], string> = {
  lodging: 'Lodging',
  food: 'Food & Drinks',
  transport: 'Transport',
  activities: 'Activities',
  shopping: 'Shopping',
  other: 'Other',
}

const categoryColors: Record<Expense['category'], string> = {
  lodging: 'bg-violet-500',
  food: 'bg-amber-500',
  transport: 'bg-sky-500',
  activities: 'bg-rose-500',
  shopping: 'bg-emerald-500',
  other: 'bg-slate-500',
}

export default function ExpensesPage() {
  const { currentTrip: trip, currentUser } = useTrip()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('expenses')
  const currentUserId = currentUser.id

  const filteredExpenses = trip.expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0)
  const settledAmount = trip.expenses.filter(e => e.settled).reduce((sum, e) => sum + e.amount, 0)

  const balances = useMemo(() => 
    calculateBalances(trip.travelers, trip.expenses),
    [trip.travelers, trip.expenses]
  )

  const currentUserBalance = balances.get(currentUserId)

  const getTravelerById = (id: string) => trip.travelers.find(t => t.id === id)

  const categoryTotals = trip.expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<Expense['category'], number>)

  return (
    <div className="min-h-[calc(100vh-105px)]">
      {/* Header */}
      <motion.div 
        className="border-b border-border bg-card/50 px-4 py-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
              <p className="text-sm text-muted-foreground">
                Track and split costs with your group
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/5"
                >
                  <Sparkles className="h-4 w-4" />
                  Smart Split
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="sm" className="gap-1.5 rounded-xl shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Summary cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Total spent */}
          <motion.div 
            className="bg-card border border-border rounded-2xl p-5 hover-lift"
            whileHover={{ borderColor: 'var(--primary)' }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Wallet className="h-4 w-4" />
              Total spent
            </div>
            <div className="text-3xl font-bold text-foreground">
              ${totalSpent.toLocaleString()}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>{Math.round((settledAmount / totalSpent) * 100)}% settled</span>
                <span>${settledAmount} of ${totalSpent}</span>
              </div>
              <Progress value={(settledAmount / totalSpent) * 100} className="h-2" />
            </div>
          </motion.div>

          {/* Your balance */}
          <motion.div 
            className="bg-card border border-border rounded-2xl p-5 hover-lift"
            whileHover={{ borderColor: 'var(--primary)' }}
          >
            <div className="text-sm text-muted-foreground mb-2">Your balance</div>
            <div className={cn(
              'text-3xl font-bold',
              currentUserBalance && currentUserBalance.net > 0 
                ? 'text-green-600' 
                : currentUserBalance && currentUserBalance.net < 0 
                  ? 'text-red-600' 
                  : 'text-foreground'
            )}>
              {currentUserBalance && currentUserBalance.net > 0 && '+'}
              ${Math.abs(currentUserBalance?.net || 0).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {currentUserBalance && currentUserBalance.net > 0 
                ? 'Others owe you'
                : currentUserBalance && currentUserBalance.net < 0
                  ? 'You owe others'
                  : 'All settled up'}
            </div>
          </motion.div>

          {/* Quick settle */}
          <motion.div 
            className="bg-card border border-border rounded-2xl p-5 hover-lift"
            whileHover={{ borderColor: 'var(--primary)' }}
          >
            <div className="text-sm text-muted-foreground mb-3">Settle up</div>
            {currentUserBalance && currentUserBalance.owes.size > 0 ? (
              <div className="space-y-2">
                {Array.from(currentUserBalance.owes.entries()).slice(0, 2).map(([userId, amount]) => {
                  const user = getTravelerById(userId)
                  if (!user) return null
                  return (
                    <div key={userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: user.color }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </motion.div>
                        <span className="text-sm text-foreground">{user.name.split(' ')[0]}</span>
                      </div>
                      <span className="text-sm font-semibold text-red-600">-${amount.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            ) : currentUserBalance && currentUserBalance.owed.size > 0 ? (
              <div className="space-y-2">
                {Array.from(currentUserBalance.owed.entries()).slice(0, 2).map(([userId, amount]) => {
                  const user = getTravelerById(userId)
                  if (!user) return null
                  return (
                    <div key={userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: user.color }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </motion.div>
                        <span className="text-sm text-foreground">{user.name.split(' ')[0]}</span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">+${amount.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">All settled</span>
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full mt-4 text-xs rounded-xl">
              View all balances
            </Button>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <motion.div 
            className="flex items-center justify-between mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TabsList className="rounded-xl bg-muted p-1">
              <TabsTrigger value="expenses" className="rounded-lg">Expenses</TabsTrigger>
              <TabsTrigger value="breakdown" className="rounded-lg">Breakdown</TabsTrigger>
              <TabsTrigger value="balances" className="rounded-lg">Balances</TabsTrigger>
            </TabsList>

            {selectedTab === 'expenses' && (
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm w-[180px] rounded-xl"
                />
              </div>
            )}
          </motion.div>

          <TabsContent value="expenses" className="mt-0">
            {filteredExpenses.length === 0 ? (
              <motion.div 
                className="text-center py-20 bg-card border border-border rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div 
                  className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-secondary mb-5"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Receipt className="h-7 w-7 text-secondary-foreground" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-2">No expenses yet</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                  Start tracking your trip expenses and split costs easily with your group.
                </p>
                <Button size="sm" className="gap-1.5 rounded-xl shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense, index) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    getTravelerById={getTravelerById}
                    currentUserId={currentUserId}
                    index={index}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="breakdown" className="mt-0">
            <motion.div 
              className="bg-card border border-border rounded-2xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-semibold text-foreground mb-5">Spending by category</h3>
              <div className="space-y-4">
                {(Object.entries(categoryTotals) as [Expense['category'], number][])
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount], index) => {
                    const Icon = categoryIcons[category]
                    const percentage = (amount / totalSpent) * 100
                    return (
                      <motion.div 
                        key={category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'h-9 w-9 rounded-xl flex items-center justify-center',
                              categoryColors[category]
                            )}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {categoryLabels[category]}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-foreground">
                              ${amount.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <Progress value={percentage} className={cn('h-2.5 rounded-full', categoryColors[category])} />
                      </motion.div>
                    )
                  })}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="balances" className="mt-0">
            <div className="space-y-3">
              {trip.travelers.map((traveler, index) => {
                const balance = balances.get(traveler.id)
                if (!balance) return null
                
                return (
                  <motion.div 
                    key={traveler.id}
                    className="bg-card border border-border rounded-2xl p-5 hover-lift"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ borderColor: 'var(--primary)' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
                          style={{ backgroundColor: traveler.color }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {traveler.name.split(' ').map(n => n[0]).join('')}
                        </motion.div>
                        <div>
                          <div className="font-semibold text-foreground">{traveler.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {balance.owes.size} payment{balance.owes.size !== 1 ? 's' : ''} pending
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        'text-xl font-bold',
                        balance.net > 0 ? 'text-green-600' : balance.net < 0 ? 'text-red-600' : 'text-muted-foreground'
                      )}>
                        {balance.net > 0 ? '+' : ''}{balance.net === 0 ? 'Settled' : `$${balance.net.toFixed(2)}`}
                      </div>
                    </div>

                    {(balance.owes.size > 0 || balance.owed.size > 0) && (
                      <div className="space-y-2 pt-4 border-t border-border">
                        {Array.from(balance.owes.entries()).map(([userId, amount]) => {
                          const user = getTravelerById(userId)
                          if (!user) return null
                          return (
                            <div key={`owes-${userId}`} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <ArrowUpRight className="h-4 w-4 text-red-500" />
                                Owes {user.name.split(' ')[0]}
                              </div>
                              <span className="font-semibold text-red-600">${amount.toFixed(2)}</span>
                            </div>
                          )
                        })}
                        {Array.from(balance.owed.entries()).map(([userId, amount]) => {
                          const user = getTravelerById(userId)
                          if (!user) return null
                          return (
                            <div key={`owed-${userId}`} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                Gets back from {user.name.split(' ')[0]}
                              </div>
                              <span className="font-semibold text-green-600">${amount.toFixed(2)}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ExpenseCard({
  expense,
  getTravelerById,
  currentUserId,
  index
}: {
  expense: Expense
  getTravelerById: (id: string) => Traveler | undefined
  currentUserId: string
  index: number
}) {
  const Icon = categoryIcons[expense.category]
  const paidBy = getTravelerById(expense.paidBy)
  const yourShare = expense.splitWith.includes(currentUserId) 
    ? expense.amount / expense.splitWith.length 
    : 0
  const youPaid = expense.paidBy === currentUserId

  return (
    <motion.div 
      className="bg-card border border-border rounded-2xl p-4 hover-lift"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
      whileHover={{ borderColor: 'var(--primary)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <motion.div 
            className={cn(
              'h-11 w-11 rounded-xl flex items-center justify-center shrink-0',
              categoryColors[expense.category]
            )}
            whileHover={{ scale: 1.1 }}
          >
            <Icon className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground">{expense.description}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span>{format(parseISO(expense.date), 'MMM d')}</span>
              <span>Paid by {youPaid ? 'you' : paidBy?.name.split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex -space-x-2">
                {expense.splitWith.slice(0, 4).map((userId) => {
                  const user = getTravelerById(userId)
                  if (!user) return null
                  return (
                    <motion.div
                      key={user.id}
                      className="h-6 w-6 rounded-full border-2 border-card flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: user.color }}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                    >
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </motion.div>
                  )
                })}
              </div>
              <span className="text-xs text-muted-foreground">
                Split {expense.splitWith.length} ways
              </span>
              {expense.settled && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  <Check className="h-2.5 w-2.5 mr-0.5" />
                  Settled
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="font-bold text-lg text-foreground">${expense.amount.toLocaleString()}</div>
          {yourShare > 0 && !youPaid && (
            <div className="text-xs text-muted-foreground mt-0.5">
              Your share: ${yourShare.toFixed(2)}
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 mt-1 rounded-lg">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem>Edit expense</DropdownMenuItem>
              <DropdownMenuItem>View receipt</DropdownMenuItem>
              <DropdownMenuItem>Mark as settled</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  )
}
