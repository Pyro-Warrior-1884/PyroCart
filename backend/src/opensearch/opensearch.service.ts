import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class OpensearchService implements OnModuleInit {
  private readonly logger = new Logger(OpensearchService.name);
  private client!: Client;
  private readonly indexName = 'products';

  async onModuleInit() {
    this.client = new Client({
      node: process.env.OPENSEARCH_URL || 'http://opensearch:9200',
    });

    this.logger.log('OpenSearch client initialized');

    await this.waitForOpenSearch();
    await this.ensureIndex();
  }

  private async waitForOpenSearch() {
    let attempts = 0;

    while (attempts < 10) {
      try {
        await this.client.cluster.health();
        this.logger.log('OpenSearch is ready');
        return;
      } catch {
        attempts++;
        this.logger.warn(`Waiting for OpenSearch... (${attempts}/10)`);
        await new Promise((res) => setTimeout(res, 2000));
      }
    }

    this.logger.error('OpenSearch did not become ready in time');
  }

  private async ensureIndex() {
    try {
      const exists = await this.client.indices.exists({
        index: this.indexName,
      });

      if (!exists.body) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  product_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop'],
                  },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: 'integer' },
                name: {
                  type: 'text',
                  analyzer: 'product_analyzer',
                  fields: { keyword: { type: 'keyword' } },
                },
                description: {
                  type: 'text',
                  analyzer: 'product_analyzer',
                },
                price: { type: 'float' },
                category: { type: 'keyword' },
                createdAt: { type: 'date' },
              },
            },
          },
        });

        this.logger.log('Products index created');
      } else {
        this.logger.log('Products index already exists');
      }
    } catch (error) {
      this.logger.error('Failed to ensure OpenSearch index', error);
    }
  }

  async indexProduct(product: any) {
    try {
      await this.client.index({
        index: this.indexName,
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
        index: this.indexName,
        id: productId.toString(),
        refresh: true,
      });
    } catch {
      this.logger.warn(`Failed to delete product ${productId} from OpenSearch`);
    }
  }

  async search(query: string) {
    const result = await this.client.search({
      index: this.indexName,
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

    const hits = result.body.hits.hits.map((hit: any) => hit._source);

    this.logger.debug(`Search "${query}" → ${hits.length} results`);

    return hits;
  }
}