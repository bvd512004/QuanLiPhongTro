package sba301.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "payment_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentSetting extends BaseEntity {

    @Column(name = "setting_key", unique = true, nullable = false, length = 100)
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String settingValue;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "category", length = 50)
    private String category; // BANK_INFO, QR_CODE, PAYMENT_GATEWAY, etc.

    // Predefined setting keys as constants
    public static final String BANK_NAME = "BANK_NAME";
    public static final String BANK_ACCOUNT_NUMBER = "BANK_ACCOUNT_NUMBER";
    public static final String BANK_ACCOUNT_HOLDER = "BANK_ACCOUNT_HOLDER";
    public static final String BANK_BRANCH = "BANK_BRANCH";
    public static final String QR_CODE_URL = "QR_CODE_URL";
    public static final String MOMO_MERCHANT_ID = "MOMO_MERCHANT_ID";
    public static final String VNPAY_MERCHANT_ID = "VNPAY_MERCHANT_ID";
    public static final String PAYMENT_NOTES = "PAYMENT_NOTES";
}

