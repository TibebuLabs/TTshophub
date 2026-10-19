import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  RawBodyRequest,
  Req,
  Logger,
} from '@nestjs/common';
import { ChapaService } from './chapa.service';
import { InitializePaymentDto, VerifyPaymentDto, ChapaWebhookDto } from './payment.dto';
import { OrdersService } from '../orders.service';

/**
 * Payment Controller
 * 
 * Handles Chapa payment gateway operations:
 * - Initialize payments
 * - Handle webhooks
 * - Verify payment status
 */
@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly chapaService: ChapaService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * Initialize a Chapa payment transaction
   * POST /api/payments/initialize
   */
  @Post('initialize')
  async initializePayment(@Body() dto: InitializePaymentDto) {
    try {
      const txRef = this.chapaService.generateTxRef(dto.orderCode);
      
      // Get base URL from environment or use default
      const baseUrl = process.env.WEB_ORIGIN?.split(',')[0] || 'http://localhost:3000';
      const apiUrl = process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:4000';

      const result = await this.chapaService.initializePayment({
        amount: dto.amount,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        txRef,
        callbackUrl: `${apiUrl}/api/payments/webhook`,
        returnUrl: `${baseUrl}/payment/success?tx_ref=${txRef}&order_id=${dto.orderId}`,
        orderCode: dto.orderCode,
      });

      this.logger.log(`Payment initialized for order ${dto.orderCode}: ${txRef}`);

      return {
        success: true,
        data: {
          checkoutUrl: result.checkoutUrl,
          txRef: result.txRef,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to initialize payment: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle Chapa webhook callbacks
   * POST /api/payments/webhook
   */
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('chapa-signature') signature: string,
    @Body() webhook: ChapaWebhookDto,
  ) {
    try {
      this.logger.log(`Received webhook for tx_ref: ${webhook.tx_ref}`);

      // Verify webhook signature if available
      if (signature && req.rawBody) {
        const isValid = this.chapaService.verifyWebhookSignature(
          req.rawBody.toString(),
          signature,
        );

        if (!isValid) {
          this.logger.warn(`Invalid webhook signature for tx_ref: ${webhook.tx_ref}`);
          return { success: false, message: 'Invalid signature' };
        }
      }

      // Extract order code from tx_ref (format: NM-40001-1234567890)
      const orderCode = webhook.tx_ref.split('-').slice(0, 2).join('-');

      // Update order payment status based on webhook status
      if (webhook.status === 'success') {
        this.logger.log(`Payment successful for order ${orderCode}`);
        // TODO: Update order status to 'paid' and 'placed'
        // await this.ordersService.markAsPaid(orderCode, webhook.tx_ref);
      } else if (webhook.status === 'failed') {
        this.logger.log(`Payment failed for order ${orderCode}`);
        // TODO: Update order status to 'payment_failed'
        // await this.ordersService.markAsPaymentFailed(orderCode);
      }

      return { success: true };
    } catch (error: any) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify payment status
   * GET /api/payments/verify/:txRef
   */
  @Get('verify/:txRef')
  async verifyPayment(@Param('txRef') txRef: string) {
    try {
      const result = await this.chapaService.verifyPayment(txRef);

      this.logger.log(`Payment verification for ${txRef}: ${result.status}`);

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      this.logger.error(`Payment verification failed: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
