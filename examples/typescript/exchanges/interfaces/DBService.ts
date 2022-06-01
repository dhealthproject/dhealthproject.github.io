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

export interface DBService {
  /**
   * Check if user uuid exist.
   * @param uuid User unique identifier.
   * @returns boolean
   */
  existsUser(uuid: string): boolean;

  /**
   * Gets the user relative amount of tokenId mosaics.
   * @param uuid User unique identifier.
   * @param tokenId Mosaic identifier.
   * @returns number
   */
  getUserAmount(uuid: string, tokenId: MosaicId): number;

  /**
   * Check if transaction hash exist.
   * @param hash Transaction hash.
   * @param index Transaction index within an aggregate transaction.
   * @returns boolean
   */
  existsTransaction(hash: string, index: number): boolean;

  /**
   * Get the last processed block height.
   * @returns Transaction
   */
  getLastProcessedHeight(): UInt64;

  /**
   * Set the last processed block height.
   * @param height Height of the last block that has been processed
   * @returns boolean
   */
  setLastProcessedHeight(height: UInt64): boolean;

  /**
   * Records dhealth.dhp deposits for a given user.
   * The transaction hash and index is also stored for record-keeping, and to avoid
   * processing the same transaction more than once.
   * @param uuid User unique identifier.
   * @param amount Absolute amount of dhealth.dhp tokens.
   * @param hash Transaction hash.
   * @param index Transaction index within an aggregate transaction.
   * @returns boolean
   */
  recordDeposit(
    uuid: string,
    amount: number,
    hash: string,
    index: number,
  ): boolean;

  /**
   * Records dhealth.dhp withdrawal for a given user.
   * @param uuid User unique identifier.
   * @param amount Absolute amount of dhealth.dhp tokens.
   * @param hash Transaction hash.
   * @returns boolean
   */
  recordWithdrawal(uuid: string, amount: number, hash: string): boolean;
}
