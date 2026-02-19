import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class OpensearchService implements OnModuleInit {
  private readonly logger = new Logger(OpensearchService.name);
  private client!: Client;

  onModuleInit() {
    this.client = new Client({
      node: process.env.OPENSEARCH_URL || 'http://opensearch:9200',
    });

    this.logger.log('OpenSearch client initialized');
  }

  async indexProduct(product: any) {
    try {
      await this.client.index({
        index: 'products',
        id: product.id.toString(),
        refresh: true,
        body: {
          id: product.id,
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          category: product.category?.name ?? '',
          createdAt: product.createdAt,
        },
      });
    } catch (error) {
      this.logger.error('Failed to index product', error);
    }
  }

  async deleteProduct(productId: number) {
    try {
      await this.client.delete({
        index: 'products',
        id: productId.toString(),
        refresh: true,
      });
    } catch {
      this.logger.warn(`Failed to delete product ${productId} from OpenSearch`);
    }
  }

  async search(query: string) {
    const result = await this.client.search({
      index: 'products',
      body: {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query,
                  fields: ['name^4', 'description'],
                  fuzziness: 'AUTO',
                  operator: 'and',
                  minimum_should_match: '70%',
                },
              },

              {
                prefix: {
                  name: {
                    value: query.toLowerCase(),
                    boost: 2,
                  },
                },
              },
            ],
          },
        },
        size: 10,
      },
    });

    const hits = result.body.hits.hits.map((hit) => hit._source);

    this.logger.debug(`Search "${query}" → ${hits.length} results`);

    return hits;
  }
}
