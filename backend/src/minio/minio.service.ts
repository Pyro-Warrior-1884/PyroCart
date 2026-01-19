import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import { randomUUID } from 'crypto';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Client;
  private bucket: string;

  async onModuleInit() {
    this.bucket = process.env.MINIO_BUCKET as string;

    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT as string,
      port: Number(process.env.MINIO_PORT),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY as string,
      secretKey: process.env.MINIO_SECRET_KEY as string,
    });

    await this.ensureBucket();
  }

  private async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      console.log(`MinIO bucket created: ${this.bucket}`);
    }
  }

  async uploadProductImage(
    buffer: Buffer,
    mimeType: string,
    productId: number,
  ) {
    const objectKey = `products/${productId}/${randomUUID()}`;

    await this.client.putObject(this.bucket, objectKey, buffer, buffer.length, {
      'Content-Type': mimeType,
    });

    return objectKey;
  }

  async deleteObject(objectKey: string) {
    await this.client.removeObject(this.bucket, objectKey);
  }

  async getSignedUrl(objectKey: string, expirySeconds = 3600) {
    return this.client.presignedGetObject(
      this.bucket,
      objectKey,
      expirySeconds,
    );
  }
}
