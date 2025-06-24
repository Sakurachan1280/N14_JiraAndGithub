import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import com.google.zxing.WriterException;

public class QrPaymentActivity extends AppCompatActivity {
    private ImageView ivQr;
    private ProgressBar progress;
    private Button btnPay;
    private PaymentService paymentService;
    private Order currentOrder;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_payment);

        ivQr     = findViewById(R.id.ivQr);
        progress = findViewById(R.id.progress);
        btnPay   = findViewById(R.id.btnPay);

        paymentService = new PaymentService();
        // Giả sử bạn truyền Order từ Intent
        currentOrder = new Order("ORD123", 450000, "VND");

        btnPay.setOnClickListener(v -> startQrFlow());
    }

    private void startQrFlow() {
        progress.setVisibility(View.VISIBLE);
        ivQr.setVisibility(View.INVISIBLE);

        // 1. Lấy URL thanh toán (thường từ Order.getPaymentUrl() hoặc gọi API backend)
        String qrContent = currentOrder.getPaymentUrl();

        // 2. Tạo QR
        try {
            Bitmap qrBitmap = paymentService.generateQRCodeBitmap(qrContent);
            ivQr.setImageBitmap(qrBitmap);
            ivQr.setVisibility(View.VISIBLE);
            progress.setVisibility(View.GONE);

            // 3. Bắt đầu polling trạng thái payment
            paymentService.pollPaymentStatus(currentOrder.getId(), new PaymentService.PaymentStatusCallback() {
                @Override
                public void onSuccess() {
                    runOnUiThread(() -> {
                        Toast.makeText(QrPaymentActivity.this, "Thanh toán thành công!", Toast.LENGTH_LONG).show();
                        // chuyển về màn hình khác, cập nhật DB, v.v.
                    });
                }
                @Override
                public void onError(Throwable t) {
                    runOnUiThread(() -> {
                        Toast.makeText(QrPaymentActivity.this, "Lỗi kiểm tra thanh toán: " + t.getMessage(), Toast.LENGTH_LONG).show();
                    });
                }
            });

        } catch (WriterException e) {
            progress.setVisibility(View.GONE);
            Toast.makeText(this, "Không tạo được QR: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }
}
