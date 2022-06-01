/**
 * This file is part of dHealth Documentation shared under LGPL-3.0
 * Copyright (C) 2022-present dHealth Network, All rights reserved.
 *
 * @package     dHealth Documentation
 * @subpackage  Typescript
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
import { MosaicId, UInt64 } from '@dhealth/sdk';
import { DBService } from './DBService';

/* eslint-disable */
export class DBServiceImpl implements DBService {
  // Stores the last blockchain height that has been processed.
  lastProcessedHeight = UInt64.fromUint(100000);

  existsUser(uuid: string) {
    // Mockup: Assume all UUID are correct
    return true;
  }

  getUserAmount(uuid: string, tokenId: MosaicId) {
    // Mockup: Assume user always has funds
    return 1000;
  }

  existsTransaction(hash: string, index: number) {
    // Mockup: Assume transactions never exist
    return false;
  }

  getLastProcessedHeight() {
    // Mockup: Return the last processed height
    return this.lastProcessedHeight;
  }

  setLastProcessedHeight(height: UInt64) {
    // Mockup: Store the last processed height
    this.lastProcessedHeight = height;
    console.log('Last processed height:', height.compact());
    return true;
  }

  recordDeposit(uuid: string, amount: number, hash: string, index: number) {
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

  recordWithdrawal(uuid: string, amount: number, hash: string) {
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
