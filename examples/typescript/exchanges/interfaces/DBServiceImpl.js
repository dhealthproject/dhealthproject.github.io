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
const dhealth_sdk_1 = require('@dhealth/sdk');
/* eslint-disable */
class DBServiceImpl {
  constructor() {
    // Stores the last blockchain height that has been processed.
    this.lastProcessedHeight = dhealth_sdk_1.UInt64.fromUint(100000);
  }
  existsUser(uuid) {
    // Mockup: Assume all UUID are correct
    return true;
  }
  getUserAmount(uuid, tokenId) {
    // Mockup: Assume user always has funds
    return 1000;
  }
  existsTransaction(hash, index) {
    // Mockup: Assume transactions never exist
    return false;
  }
  getLastProcessedHeight() {
    // Mockup: Return the last processed height
    return this.lastProcessedHeight;
  }
  setLastProcessedHeight(height) {
    // Mockup: Store the last processed height
    this.lastProcessedHeight = height;
    console.log('Last processed height:', height.compact());
    return true;
  }
  recordDeposit(uuid, amount, hash, index) {
    // Mockup: Do nothing, just display
    console.log(
      'Recording deposit from',
      uuid,
      'amount',
      amount,
      'hash',
      hash,
      'index',
      index,
    );
    return false;
  }
  recordWithdrawal(uuid, amount, hash) {
    // Mockup: Do nothing, just display
    console.log(
      'Recording withdrawal from',
      uuid,
      'amount',
      amount,
      'hash',
      hash,
    );
    return false;
  }
}
exports.DBServiceImpl = DBServiceImpl;
