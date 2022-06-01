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
const rxjs_1 = require('rxjs');
const operators_1 = require('rxjs/operators');
const dhealth_sdk_1 = require('@dhealth/sdk');
const DBServiceImpl_1 = require('./interfaces/DBServiceImpl');
const example = async () => {
  var _a, _b;
  /* start block sendWithdrawal */
  // Mocks a database service
  const dbService = new DBServiceImpl_1.DBServiceImpl();
  // Exchange configuration
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
  // Repositories
  const repositoryFactory = new dhealth_sdk_1.RepositoryFactoryHttp(
    config.apiUrl,
  );
  const listener = repositoryFactory.createListener();
  const transactionHttp = repositoryFactory.createTransactionRepository();
  const chainHttp = repositoryFactory.createChainRepository();
  const transactionService = new dhealth_sdk_1.TransactionService(
    transactionHttp,
    repositoryFactory.createReceiptRepository(),
  );
  const transactionPaginationStreamer = new dhealth_sdk_1.TransactionPaginationStreamer(
    transactionHttp,
  );
  // Replace with exchange account private key
  const exchangeAccountPrivateKey = process.env.PRIVATE_KEY;
  const exchangeAccount = dhealth_sdk_1.Account.createFromPrivateKey(
    exchangeAccountPrivateKey,
    config.networkType,
  );
  // Replace with destination address from user's request
  const userRawAddress = process.env.RECIPIENT_ADDRESS;
  const userAddress = dhealth_sdk_1.Address.createFromRawAddress(userRawAddress);
  // Replace with the source UUID from user's request
  const uuid = process.env.UUID;
  // Replace with amount of tokens to transfer from user's request
  const relativeAmount = parseFloat(process.env.AMOUNT);
  // Check that the user has enough funds
  if (dbService.getUserAmount(uuid, config.tokenId) < relativeAmount) {
    throw Error('User ' + uuid + ' does not have enough funds.');
  }
  // 1. Create withdrawal transaction
  const absoluteAmount =
    relativeAmount * Math.pow(10, config.tokenDivisibility);
  const token = new dhealth_sdk_1.Mosaic(
    config.tokenId,
    dhealth_sdk_1.UInt64.fromUint(absoluteAmount),
  );
  const epochAdjustment = await repositoryFactory
    .getEpochAdjustment()
    .toPromise();
  const withdrawalTransaction = dhealth_sdk_1.TransferTransaction.create(
    dhealth_sdk_1.Deadline.create(epochAdjustment),
    userAddress,
    [token],
    dhealth_sdk_1.EmptyMessage,
    config.networkType,
    dhealth_sdk_1.UInt64.fromUint(200000),
  );
  // 2. Sign transaction
  const signedTransaction = exchangeAccount.sign(
    withdrawalTransaction,
    config.networkGenerationHashSeed,
  );
  // 3. Announce transaction and wait for confirmation
  console.log('Announcing transaction', signedTransaction.hash);
  await listener.open();
  const transaction = await transactionService
    .announce(signedTransaction, listener)
    .toPromise();
  console.log(
    'Transaction confirmed at height',
    (_b =
      (_a = transaction.transactionInfo) === null || _a === void 0
        ? void 0
        : _a.height.compact()) !== null && _b !== void 0
      ? _b
      : 0,
  );
  listener.close();
  /* end block sendWithdrawal */
  // Polling loop, every 30s
  const poller = rxjs_1.timer(0, 30000).subscribe(async () => {
    var _a, _b;
    /* start block pollWithdrawal */
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
    // Bail out if there have been no new (final) transactions since last check
    const lastProcessedHeight = dbService.getLastProcessedHeight();
    if (lastProcessedHeight.equals(maxHeight)) return;
    // Look for confirmed transactions signed by the central account address,
    // in the desired block height range.
    const searchCriteria = {
      group: dhealth_sdk_1.TransactionGroup.Confirmed,
      signerPublicKey: exchangeAccount.publicKey,
      embedded: true,
      order: dhealth_sdk_1.Order.Asc,
      type: [dhealth_sdk_1.TransactionType.TRANSFER],
      fromHeight: lastProcessedHeight.add(dhealth_sdk_1.UInt64.fromUint(1)),
      toHeight: maxHeight,
    };
    const data = await transactionPaginationStreamer
      .search(searchCriteria)
      .pipe(operators_1.toArray())
      .toPromise();
    console.log(
      'Processing',
      data.length,
      'entries from height',
      (_a = searchCriteria.fromHeight) === null || _a === void 0
        ? void 0
        : _a.compact(),
      'to',
      (_b = searchCriteria.toHeight) === null || _b === void 0
        ? void 0
        : _b.compact(),
    );
    // Record the valid withdrawals in the exchange database
    data.forEach((transaction) => {
      var _a;
      const transactionInfo = transaction.transactionInfo;
      if (!transactionInfo) return;
      const transactionHash =
        transactionInfo instanceof dhealth_sdk_1.AggregateTransactionInfo
          ? transactionInfo.aggregateHash
          : (_a = transactionInfo.hash) !== null && _a !== void 0
          ? _a
          : '';
      const amount =
        transaction.mosaics[0].amount.compact() /
        Math.pow(10, config.tokenDivisibility);
      dbService.recordWithdrawal(uuid, amount, transactionHash);
    });
    // Store the last height that has been processed
    dbService.setLastProcessedHeight(maxHeight);
    /* end block pollWithdrawal */
  });
};
example();
