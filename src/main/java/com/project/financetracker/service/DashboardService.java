package com.project.financetracker.service;

import com.project.financetracker.dto.DashboardResponse;
import com.project.financetracker.model.Transaction;
import com.project.financetracker.model.User;
import com.project.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;

    public DashboardResponse buildDashboard(User user, YearMonth period) {
        LocalDate startDate = period.atDay(1);
        LocalDate endDate = period.atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(user.getId(), startDate, endDate);

        BigDecimal totalIncome = sumByType(transactions, Transaction.Type.INCOME);
        BigDecimal totalExpenses = sumByType(transactions, Transaction.Type.EXPENSE);
        BigDecimal net = totalIncome.subtract(totalExpenses).setScale(2, RoundingMode.HALF_EVEN);

        List<DashboardResponse.CategoryBreakdown> byCategory = buildCategoryBreakdown(transactions);

        return new DashboardResponse(startDate, endDate, totalIncome, totalExpenses, net, byCategory);
    }

    private BigDecimal sumByType(List<Transaction> transactions, Transaction.Type type) {
        return transactions.stream()
                .filter(t -> t.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_EVEN);
    }

    private List<DashboardResponse.CategoryBreakdown> buildCategoryBreakdown(List<Transaction> transactions) {
        record CategoryKey(Long id, String name) {}

        return transactions.stream()
                .filter(t -> t.getType() == Transaction.Type.EXPENSE)
                .collect(Collectors.groupingBy(
                        t -> new CategoryKey(t.getCategory().getId(), t.getCategory().getName()),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ))
                .entrySet().stream()
                .map(e -> new DashboardResponse.CategoryBreakdown(
                        e.getKey().id(),
                        e.getKey().name(),
                        e.getValue().setScale(2, RoundingMode.HALF_EVEN)
                ))
                .sorted(Comparator.comparing(DashboardResponse.CategoryBreakdown::total).reversed())
                .toList();
    }
}
