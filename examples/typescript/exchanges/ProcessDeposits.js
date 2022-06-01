'use strict';
/**
 * This file is part of dHealth Documentation shared under LGPL-3.0
 * Copyright (C) 2022-present dHealth Network, All rights reserved.
 *
 * @package     dHealth Documentation
 * @subpackage  Javascript
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
Object.defineProperty(exports, '__esModule', { value: true });
const operators_1 = require('rxjs/operators');
const dhealth_sdk_1 = require('@dhealth/sdk');
const DBServiceImpl_1 = require('./interfaces/DBServiceImpl');
const example = async () => {
  /* start block processDeposits */
  // Mocks a database service
  const dbService = new DBServiceImpl_1.DBServiceImpl();
  const config = {
    // Replace with your node URL
    apiUrl: 'NODE_URL',
    // Use MAIN_NET or TEST_NET
    networkType: dhealth_sdk_1.NetworkType.MAIN_NET,
    // Replace with value from http://<API-NODE-URL>:3000/network/properties
    networkGenerationHashSeed:
      'ED5761EA890A096C50D3F50B7C2F0CCB4B84AFC9EA870F381E84DDE36D04EF16',
    // Replace with the account central address
    centralAccountAddress: dhealth_sdk_1.Address.createFromRawAddress(
      'NC5WRDIXW3E4VQOVW3AOHECBYTBT2DKREQIZ63A',
    ),
    // Use 39E0C49FA322A459 for MAIN_NET
    tokenId: new dhealth_sdk_1.MosaicId('39E0C49FA322A459'),
    tokenAlias: new dhealth_sdk_1.NamespaceId('dhealth.dhp'),
    tokenDivisibility: 6,
    requiredConfirmations: 20,
  };
  const repositoryFactory = new dhealth_sdk_1.RepositoryFactoryHttp(
    config.apiUrl,
  );
  const chainHttp = repositoryFactory.createChainRepository();
  const transactionHttp = repositoryFactory.createTransactionRepository();
  const transactionPaginationStreamer = new dhealth_sdk_1.TransactionPaginationStreamer(
    transactionHttp,
  );
  // Get current chain height and latest finalized block
  const {
    height: currentHeight,
    latestFinalizedBlock: finalizationBlock,
  } = await chainHttp.getChainInfo().toPromise();
  const maxHeight = config.useFinalization
    ? finalizationBlock.height
    : currentHeight.subtract(
        dhealth_sdk_1.UInt64.fromUint(config.requiredConfirmations),
      );
  // 1. Look for confirmed transactions destined to the central account address,
  // in the desired block height range.
  const searchCriteria = {
    group: dhealth_sdk_1.TransactionGroup.Confirmed,
    recipientAddress: config.centralAccountAddress,
    embedded: true,
    order: dhealth_sdk_1.Order.Asc,
    type: [dhealth_sdk_1.TransactionType.TRANSFER],
    fromHeight: dbService.getLastProcessedHeight(),
    toHeight: maxHeight,
  };
  const data = await transactionPaginationStreamer
    .search(searchCriteria)
    .pipe(operators_1.toArray())
    .toPromise();
  // 2. Exclude invalid transactions
  const results = data.filter((transaction) => {
    var _a;
    const transactionInfo = transaction.transactionInfo;
    if (!transactionInfo) return false;
    const transactionIndex = transactionInfo.index;
    const transactionHash =
      transactionInfo instanceof dhealth_sdk_1.AggregateTransactionInfo
        ? transactionInfo.aggregateHash
        : (_a = transactionInfo.hash) !== null && _a !== void 0
        ? _a
        : '';
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
    var _a;
    const transactionInfo = transaction.transactionInfo;
    if (!transactionInfo) return;
    const transactionHash =
      transactionInfo instanceof dhealth_sdk_1.AggregateTransactionInfo
        ? transactionInfo.aggregateHash
        : (_a = transactionInfo.hash) !== null && _a !== void 0
        ? _a
        : '';
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
