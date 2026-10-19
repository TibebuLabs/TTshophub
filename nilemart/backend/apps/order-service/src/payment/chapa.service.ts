import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

interface ChapaInitializeRequest {
  amount: string;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  'customization[title]': string;
  'customization[description]': string;
}

interface ChapaInitializeResponse {
  status: string;
  message: string;
  data: {
    checkout_url: string;
  };
}

interface ChapaVerifyResponse {
  status: string;
  message: string;
  data: {
    first_name: string;
    last_name: string;
    email: string;
    currency: string;
    amount: string;
    charge: string;
    mode: string;
    method: string;
    type: string;
    status: string;
    reference: string;
    tx_ref: string;
    customization: {
      title: string;
      description: string;
    };
    created_at: string;
    updated_at: string;
  };
}

/**
 * Chapa Payment Gateway Service
 * 
 * Handles payment initialization, verification, and webhook processing
 * for Ethiopian payment methods (Telebirr, CBE Birr, Cards)
 */
@Injectable()
export class ChapaService {
  private readonly logger = new Logger(ChapaService.name);
  private readonly client: AxiosInstance;
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly baseUrl: string;

  constructor(private config: ConfigService) {
    this.secretKey = this.config.get('CHAPA_SECRET_KEY') || '';
    this.webhookSecret = this.config.get('CHAPA_WEBHOOK_SECRET') || '';
    this.baseUrl = this.config.get('CHAPA_BASE_URL') || 'https://api.chapa.co/v1';

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!this.secretKey) {
      this.logger.warn('CHAPA_SECRET_KEY not configured. Payment initialization will fail.');
    }
  }

  /**
   * Initialize a payment transaction with Chapa
   * Returns a checkout URL where the customer completes payment
   */
  async initializePayment(params: {
    amount: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    txRef: string;
    callbackUrl: string;
    returnUrl: string;
    orderCode: string;
  }): Promise<{ checkoutUrl: string; txRef: string }> {
    try {
      const payload: ChapaInitializeRequest = {
        amount: params.amount.toString(),
        currency: 'ETB',
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        phone_number: params.phoneNumber,
        tx_ref: params.txRef,
        callback_url: params.callbackUrl,
        return_url: params.returnUrl,
        'customization[title]': `NileMart Order ${params.orderCode}`,
        'customization[description]': `Payment for order ${params.orderCode}`,
      };

      this.logger.log(`Initializing payment for tx_ref: ${params.txRef}`);

      const response = await this.client.post<ChapaInitializeResponse>(
        '/transaction/initialize',
        payload,
      );

      if (response.data.status === 'success') {
        this.logger.log(`Payment initialized successfully: ${params.txRef}`);
        return {
          checkoutUrl: response.data.data.checkout_url,
          txRef: params.txRef,
        };
      }

      throw new Error(response.data.message || 'Failed to initialize payment');
    } catch (error: any) {
      this.logger.error(`Payment initialization failed: ${error.message}`, error.stack);
      throw new Error(`Failed to initialize payment: ${error.message}`);
    }
  }

  /**
   * Verify a payment transaction status
   */
  async verifyPayment(txRef: string): Promise<{
    status: 'success' | 'failed' | 'pending';
    amount: number;
    currency: string;
    method: string;
    reference: string;
  }> {
    try {
      this.logger.log(`Verifying payment for tx_ref: ${txRef}`);

      const response = await this.client.get<ChapaVerifyResponse>(
        `/transaction/verify/${txRef}`,
      );

      if (response.data.status === 'success') {
        const data = response.data.data;
        const status = data.status === 'success' ? 'success' : 
                      data.status === 'failed' ? 'failed' : 'pending';

        return {
          status,
          amount: parseFloat(data.amount),
          currency: data.currency,
          method: data.method,
          reference: data.reference,
        };
      }

      throw new Error(response.data.message || 'Verification failed');
    } catch (error: any) {
      this.logger.error(`Payment verification failed: ${error.message}`, error.stack);
      throw new Error(`Failed to verify payment: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature to ensure it came from Chapa
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('CHAPA_WEBHOOK_SECRET not configured. Webhook verification disabled.');
      return true; // Allow in development
    }

    const hash = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Generate a unique transaction reference
   */
  generateTxRef(orderCode: string): string {
    const timestamp = Date.now();
    return `${orderCode}-${timestamp}`;
  }
}
