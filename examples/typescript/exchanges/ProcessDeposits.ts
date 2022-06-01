/**
 * This file is part of dHealth Documentation shared under LGPL-3.0
 * Copyright (C) 2022-present dHealth Network, All rights reserved.
 *
 * @package     dHealth Documentation
 * @subpackage  Typescript
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
import { toArray } from 'rxjs/operators';
import {
  Address,
  AggregateTransactionInfo,
  MosaicId,
  NamespaceId,
  NetworkType,
  Order,
  RepositoryFactoryHttp,
  TransactionGroup,
  TransactionPaginationStreamer,
  TransactionSearchCriteria,
  TransactionType,
  TransferTransaction,
  UInt64,
} from '@dhealth/sdk';
import { DBServiceImpl } from './interfaces/DBServiceImpl';
import { ExchangeDHPConfig } from './interfaces/ExchangeDHPConfig';

const example = async (): Promise<void> => {
  /* start block processDeposits */
  // Mocks a database service
  const dbService = new DBServiceImpl();

  const config: ExchangeDHPConfig = {
    // Replace with your node URL
    apiUrl: 'NODE_URL',
    // Use MAIN_NET or TEST_NET
    networkType: NetworkType.MAIN_NET,
    // Replace with value from http://<API-NODE-URL>:3000/network/properties
    networkGenerationHashSeed:
      'ED5761EA890A096C50D3F50B7C2F0CCB4B84AFC9EA870F381E84DDE36D04EF16',
    // Replace with the account central address
    centralAccountAddress: Address.createFromRawAddress(
      'NC5WRDIXW3E4VQOVW3AOHECBYTBT2DKREQIZ63A',
    ),
    // Use 39E0C49FA322A459 for MAIN_NET
    tokenId: new MosaicId('39E0C49FA322A459'),
    tokenAlias: new NamespaceId('dhealth.dhp'),
    tokenDivisibility: 6,
    requiredConfirmations: 20,
  };

  const repositoryFactory = new RepositoryFactoryHttp(config.apiUrl);
  const chainHttp = repositoryFactory.createChainRepository();
  const transactionHttp = repositoryFactory.createTransactionRepository();
  const transactionPaginationStreamer = new TransactionPaginationStreamer(
    transactionHttp,
  );

  // Get current chain height and latest finalized block
  const {
    height: currentHeight,
  } = await chainHttp.getChainInfo().toPromise();
  const maxHeight = currentHeight.subtract(UInt64.fromUint(config.requiredConfirmations));

  // 1. Look for confirmed transactions destined to the central account address,
  // in the desired block height range.
  const searchCriteria = {
    group: TransactionGroup.Confirmed,
    recipientAddress: config.centralAccountAddress,
    embedded: true,
    order: Order.Asc,
    type: [TransactionType.TRANSFER],
    fromHeight: dbService.getLastProcessedHeight(),
    toHeight: maxHeight,
  } as TransactionSearchCriteria;

  const data = await transactionPaginationStreamer
    .search(searchCriteria)
    .pipe(toArray() as any)
    .toPromise();

  // 2. Exclude invalid transactions
  const results = (data as TransferTransaction[]).filter((transaction) => {
    const transactionInfo = transaction.transactionInfo;
    if (!transactionInfo) return false;
    const transactionIndex = transactionInfo.index;
    const transactionHash =
      transactionInfo instanceof AggregateTransactionInfo
        ? transactionInfo.aggregateHash
        : transactionInfo.hash ?? '';

    return (
      // 2.a
      dbService.existsUser(transaction.message.payload) &&
      // 2.b
      transaction.mosaics.length === 1 &&
      (transaction.mosaics[0].id.toHex() === config.tokenId.toHex() ||
        transaction.mosaics[0].id.toHex() === config.tokenAlias.toHex()) &&
      // 2.c
      !dbService.existsTransaction(transactionHash, transactionIndex)
    );
  });

  // 3. Record the valid deposits in the exchange database
  results.forEach((transaction) => {
    const transactionInfo = transaction.transactionInfo;
    if (!transactionInfo) return;
    const transactionHash =
      transactionInfo instanceof AggregateTransactionInfo
        ? transactionInfo.aggregateHash
        : transactionInfo.hash ?? '';
    const transactionIndex = transactionInfo.index;
    const amount =
      transaction.mosaics[0].amount.compact() /
      Math.pow(10, config.tokenDivisibility);
    dbService.recordDeposit(
      transaction.message.payload,
      amount,
      transactionHash,
      transactionIndex,
    );
  });

  // 4. Store the last height that has been processed
  dbService.setLastProcessedHeight(maxHeight);
  /* end block processDeposits */
};

example();
