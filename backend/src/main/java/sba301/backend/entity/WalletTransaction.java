package sba301.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import sba301.backend.enums.TransactionStatus;
import sba301.backend.enums.TransactionType;

import java.math.BigDecimal;

@Entity
@Table(name = "wallet_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private UserWallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", length = 20, nullable = false)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "reference_id", length = 200)
    private String referenceId; // For linking to subscription or other entities

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // BANK_TRANSFER, MOMO, VNPAY, etc.

    @Column(name = "transaction_code", length = 200, unique = true)
    private String transactionCode; // Unique transaction identifier

    @Column(name = "balance_before", precision = 15, scale = 2)
    private BigDecimal balanceBefore;

    @Column(name = "balance_after", precision = 15, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // Admin notes or additional info
}

