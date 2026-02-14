import { Test, TestingModule } from '@nestjs/testing';
import { OpensearchController } from './opensearch.controller';

describe('OpensearchController', () => {
  let controller: OpensearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpensearchController],
    }).compile();

    controller = module.get<OpensearchController>(OpensearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
