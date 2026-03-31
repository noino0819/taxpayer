import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import * as api from '@/lib/api'

function useClassroomId() {
  return useAuthStore((s) => s.currentClassroom?.id)
}

function useUserId() {
  return useAuthStore((s) => s.user?.id)
}

// ═══════════════════════════════════════════
// Classroom
// ═══════════════════════════════════════════

export function useClassroom() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['classroom', classroomId],
    queryFn: () => api.getClassroom(classroomId!),
    enabled: !!classroomId,
  })
}

export function useTeacherClassrooms() {
  const userId = useUserId()
  return useQuery({
    queryKey: ['classrooms', userId],
    queryFn: () => api.getTeacherClassrooms(userId!),
    enabled: !!userId,
  })
}

export function useClassroomMembers() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['classroom-members', classroomId],
    queryFn: () => api.getClassroomMembers(classroomId!),
    enabled: !!classroomId,
  })
}

export function usePendingMembers() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['pending-members', classroomId],
    queryFn: () => api.getPendingMembers(classroomId!),
    enabled: !!classroomId,
    refetchInterval: 15_000,
  })
}

export function useApproveStudent() {
  const qc = useQueryClient()
  const classroomId = useClassroomId()
  return useMutation({
    mutationFn: (params: { membershipId: string; userId: string }) =>
      api.approveStudent(params.membershipId, classroomId!, params.userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-members'] })
      qc.invalidateQueries({ queryKey: ['classroom-members'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useRejectStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (membershipId: string) => api.rejectStudent(membershipId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-members'] })
    },
  })
}

export function useUpdateClassroom() {
  const qc = useQueryClient()
  const classroomId = useClassroomId()
  return useMutation({
    mutationFn: (updates: Parameters<typeof api.updateClassroom>[1]) =>
      api.updateClassroom(classroomId!, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classroom', classroomId] }),
  })
}

// ═══════════════════════════════════════════
// Accounts & Transactions
// ═══════════════════════════════════════════

export function useMyAccount() {
  const userId = useUserId()
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['my-account', userId, classroomId],
    queryFn: () => api.getAccount(userId!, classroomId!),
    enabled: !!userId && !!classroomId,
  })
}

export function useAllAccounts() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['accounts', classroomId],
    queryFn: () => api.getAllAccounts(classroomId!),
    enabled: !!classroomId,
  })
}

export function useMyTransactions(limit = 20) {
  const { data: account } = useMyAccount()
  return useQuery({
    queryKey: ['transactions', account?.id, limit],
    queryFn: () => api.getTransactions(account!.id, limit),
    enabled: !!account?.id,
  })
}

export function useClassroomTransactions(limit = 20) {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['classroom-transactions', classroomId, limit],
    queryFn: () => api.getClassroomTransactions(classroomId!, limit),
    enabled: !!classroomId,
  })
}

export function useAccountStats() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['account-stats', classroomId],
    queryFn: () => api.getAccountStats(classroomId!),
    enabled: !!classroomId,
  })
}

export function useMonthlyStats() {
  const { data: account } = useMyAccount()
  return useQuery({
    queryKey: ['monthly-stats', account?.id],
    queryFn: () => api.getMonthlyStats(account!.id),
    enabled: !!account?.id,
  })
}

export function useDeposit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { accountId: string; amount: number; description: string; approvedBy?: string }) =>
      api.deposit(params.accountId, params.amount, params.description, params.approvedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['my-account'] })
      qc.invalidateQueries({ queryKey: ['account-stats'] })
    },
  })
}

export function useWithdraw() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { accountId: string; amount: number; description: string; approvedBy?: string }) =>
      api.withdraw(params.accountId, params.amount, params.description, params.approvedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['my-account'] })
      qc.invalidateQueries({ queryKey: ['account-stats'] })
    },
  })
}

export function useBatchDeposit() {
  const qc = useQueryClient()
  const classroomId = useClassroomId()
  return useMutation({
    mutationFn: (params: { userIds: string[]; amount: number; description: string; approvedBy: string }) =>
      api.batchDeposit(classroomId!, params.userIds, params.amount, params.description, params.approvedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['account-stats'] })
    },
  })
}

export function useBatchWithdraw() {
  const qc = useQueryClient()
  const classroomId = useClassroomId()
  return useMutation({
    mutationFn: (params: { userIds: string[]; amount: number; description: string; approvedBy: string }) =>
      api.batchWithdraw(classroomId!, params.userIds, params.amount, params.description, params.approvedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['account-stats'] })
    },
  })
}

// ═══════════════════════════════════════════
// Jobs
// ═══════════════════════════════════════════

export function useJobs() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['jobs', classroomId],
    queryFn: () => api.getJobs(classroomId!),
    enabled: !!classroomId,
  })
}

export function useJobAssignments() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['job-assignments', classroomId],
    queryFn: () => api.getJobAssignments(classroomId!),
    enabled: !!classroomId,
  })
}

export function useMyJobAssignment() {
  const userId = useUserId()
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['my-job', userId, classroomId],
    queryFn: () => api.getUserAssignment(userId!, classroomId!),
    enabled: !!userId && !!classroomId,
  })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createJob,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useUpdateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { jobId: string; updates: Partial<Parameters<typeof api.updateJob>[1]> }) =>
      api.updateJob(params.jobId, params.updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useDeleteJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => api.deleteJob(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
      qc.invalidateQueries({ queryKey: ['job-assignments'] })
    },
  })
}

export function useAssignJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { jobId: string; userId: string }) => api.assignJob(params.jobId, params.userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job-assignments'] })
      qc.invalidateQueries({ queryKey: ['my-job'] })
    },
  })
}

export function usePaySalaries() {
  const qc = useQueryClient()
  const classroomId = useClassroomId()
  return useMutation({
    mutationFn: (params: { items: { userId: string; amount: number; jobName: string }[]; approvedBy: string }) =>
      api.paySalaries(classroomId!, params.items, params.approvedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['my-account'] })
      qc.invalidateQueries({ queryKey: ['account-stats'] })
      qc.invalidateQueries({ queryKey: ['monthly-stats'] })
    },
  })
}

// ═══════════════════════════════════════════
// Modules
// ═══════════════════════════════════════════

export function useModuleConfigs() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['module-configs', classroomId],
    queryFn: () => api.getModuleConfigs(classroomId!),
    enabled: !!classroomId,
  })
}

export function useToggleModule() {
  const qc = useQueryClient()
  const classroomId = useClassroomId()
  const userId = useUserId()
  return useMutation({
    mutationFn: (params: { moduleName: Parameters<typeof api.toggleModule>[1]; enabled: boolean }) =>
      api.toggleModule(classroomId!, params.moduleName, params.enabled, userId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['module-configs'] }),
  })
}

export function useUpdateModuleSettings() {
  const qc = useQueryClient()
  const classroomId = useClassroomId()
  return useMutation({
    mutationFn: (params: { moduleName: Parameters<typeof api.updateModuleSettings>[1]; settings: Record<string, unknown> }) =>
      api.updateModuleSettings(classroomId!, params.moduleName, params.settings),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['module-configs'] }),
  })
}

// ═══════════════════════════════════════════
// Fines
// ═══════════════════════════════════════════

export function useFines(status?: string) {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['fines', classroomId, status],
    queryFn: () => api.getFines(classroomId!, status),
    enabled: !!classroomId,
  })
}

export function useApproveFine() {
  const qc = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: (fineId: string) => api.approveFine(fineId, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fines'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useRejectFine() {
  const qc = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: (fineId: string) => api.rejectFine(fineId, userId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fines'] }),
  })
}

// ═══════════════════════════════════════════
// Notifications
// ═══════════════════════════════════════════

export function useNotifications() {
  const classroomId = useClassroomId()
  const userId = useUserId()
  return useQuery({
    queryKey: ['notifications', classroomId, userId],
    queryFn: () => api.getNotifications(classroomId!, userId),
    enabled: !!classroomId,
    refetchInterval: 30_000,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  const classroomId = useClassroomId()
  const userId = useUserId()
  return useMutation({
    mutationFn: () => api.markAllAsRead(classroomId!, userId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

// ═══════════════════════════════════════════
// Mart
// ═══════════════════════════════════════════

export function useProducts() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['products', classroomId],
    queryFn: () => api.getProducts(classroomId!),
    enabled: !!classroomId,
  })
}

export function usePurchaseProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { productId: string; buyerAccountId: string }) =>
      api.purchaseProduct(params.productId, params.buyerAccountId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['my-account'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

// ═══════════════════════════════════════════
// Investment
// ═══════════════════════════════════════════

export function useStocks() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['stocks', classroomId],
    queryFn: () => api.getStocks(classroomId!),
    enabled: !!classroomId,
  })
}

export function useMyHoldings() {
  const userId = useUserId()
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['holdings', userId, classroomId],
    queryFn: () => api.getUserHoldings(userId!, classroomId!),
    enabled: !!userId && !!classroomId,
  })
}

export function useBuyStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { stockId: string; userId: string; accountId: string; quantity: number }) =>
      api.buyStock(params.stockId, params.userId, params.accountId, params.quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['holdings'] })
      qc.invalidateQueries({ queryKey: ['my-account'] })
    },
  })
}

export function useSellStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { stockId: string; userId: string; accountId: string; quantity: number }) =>
      api.sellStock(params.stockId, params.userId, params.accountId, params.quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['holdings'] })
      qc.invalidateQueries({ queryKey: ['my-account'] })
    },
  })
}

export function useSetStockPrice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { stockId: string; newPrice: number }) =>
      api.setStockPrice(params.stockId, params.newPrice),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stocks'] }),
  })
}

export function useUpdateStockSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { stockId: string; settings: { price_impact_rate?: number; max_price_impact?: number } }) =>
      api.updateStockSettings(params.stockId, params.settings),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stocks'] }),
  })
}

export function useCloseMarketDay() {
  const qc = useQueryClient()
  const classroomId = useClassroomId()
  return useMutation({
    mutationFn: () => api.closeMarketDay(classroomId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stocks'] }),
  })
}

export function useAllStocks() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['all-stocks', classroomId],
    queryFn: () => api.getAllStocks(classroomId!),
    enabled: !!classroomId,
  })
}

export function useApplyRandomFluctuation() {
  const qc = useQueryClient()
  const classroomId = useClassroomId()
  return useMutation({
    mutationFn: (params?: { minPct?: number; maxPct?: number }) =>
      api.applyRandomFluctuation(classroomId!, params?.minPct, params?.maxPct),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['all-stocks'] })
      qc.invalidateQueries({ queryKey: ['stock-price-history'] })
    },
  })
}

export function useStockPriceHistory(stockId: string | undefined) {
  return useQuery({
    queryKey: ['stock-price-history', stockId],
    queryFn: () => api.getStockPriceHistory(stockId!),
    enabled: !!stockId,
  })
}

export function useClassroomPriceHistory() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['classroom-price-history', classroomId],
    queryFn: () => api.getClassroomPriceHistory(classroomId!),
    enabled: !!classroomId,
  })
}

export function useAddStock() {
  const qc = useQueryClient()
  const classroomId = useClassroomId()
  return useMutation({
    mutationFn: (params: { name: string; current_price: number; description: string; factor_type: string }) =>
      api.addStock(classroomId!, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['all-stocks'] })
    },
  })
}

export function useToggleStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { stockId: string; isActive: boolean }) =>
      api.toggleStock(params.stockId, params.isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['all-stocks'] })
    },
  })
}

export function useDeleteStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (stockId: string) => api.deleteStock(stockId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['all-stocks'] })
    },
  })
}

export function useEconomyEvents() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['economy-events', classroomId],
    queryFn: () => api.getEconomyEvents(classroomId!),
    enabled: !!classroomId,
  })
}

export function useCreateEconomyEvent() {
  const qc = useQueryClient()
  const classroomId = useClassroomId()
  return useMutation({
    mutationFn: (params: { title: string; description: string; effects: Record<string, number> }) =>
      api.createEconomyEvent(classroomId!, params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['economy-events'] }),
  })
}

export function useExecuteEconomyEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => api.executeEconomyEvent(eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['economy-events'] })
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['all-stocks'] })
      qc.invalidateQueries({ queryKey: ['stock-price-history'] })
    },
  })
}

export function useCancelEconomyEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => api.cancelEconomyEvent(eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['economy-events'] }),
  })
}

// ═══════════════════════════════════════════
// Bank & Savings
// ═══════════════════════════════════════════

export function useSavingsProducts() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['savings-products', classroomId],
    queryFn: () => api.getSavingsProducts(classroomId!),
    enabled: !!classroomId,
  })
}

export function useMySavings() {
  const userId = useUserId()
  return useQuery({
    queryKey: ['my-savings', userId],
    queryFn: () => api.getUserSavings(userId!),
    enabled: !!userId,
  })
}

export function useOpenSavings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { productId: string; userId: string; accountId: string; principal: number; termDays: number }) =>
      api.openSavings(params.productId, params.userId, params.accountId, params.principal, params.termDays),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-savings'] })
      qc.invalidateQueries({ queryKey: ['my-account'] })
    },
  })
}

// ═══════════════════════════════════════════
// Insurance
// ═══════════════════════════════════════════

export function useInsuranceProducts() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['insurance-products', classroomId],
    queryFn: () => api.getInsuranceProducts(classroomId!),
    enabled: !!classroomId,
  })
}

export function useMyInsurance() {
  const userId = useUserId()
  return useQuery({
    queryKey: ['my-insurance', userId],
    queryFn: () => api.getUserInsuranceContracts(userId!),
    enabled: !!userId,
  })
}

export function useJoinInsurance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { insuranceId: string; userId: string }) =>
      api.joinInsurance(params.insuranceId, params.userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-insurance'] }),
  })
}

// ═══════════════════════════════════════════
// Seats (Real Estate)
// ═══════════════════════════════════════════

export function useSeats() {
  const classroomId = useClassroomId()
  return useQuery({
    queryKey: ['seats', classroomId],
    queryFn: () => api.getSeats(classroomId!),
    enabled: !!classroomId,
  })
}

export function usePurchaseSeat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { seatId: string; buyerId: string; accountId: string }) =>
      api.purchaseSeat(params.seatId, params.buyerId, params.accountId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seats'] })
      qc.invalidateQueries({ queryKey: ['my-account'] })
    },
  })
}
